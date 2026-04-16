-- Cloddy Database Migration: Blockchain Integration
-- Run this after the main schema to add blockchain-related columns and tables

-- =====================================================
-- 1. ADD BLOCKCHAIN COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add blockchain columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_token_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_contract_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS on_chain_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_xp_sync TIMESTAMPTZ;

-- Add blockchain columns to user_badges table (if exists)
-- First, check if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_badges') THEN
    ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS token_id BIGINT;
    ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS contract_address TEXT;
    ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS minting_tx_hash TEXT;
    ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS minting_status TEXT DEFAULT 'pending';
  END IF;
END
$$;

-- Add token gate columns to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS token_gate_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS gate_contract_address TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS gate_token_address TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS gate_min_amount DECIMAL(36,18);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS gate_type TEXT; -- 'ERC20', 'ERC721', 'ERC1155'
ALTER TABLE groups ADD COLUMN IF NOT EXISTS gate_token_id BIGINT; -- For ERC1155

-- =====================================================
-- 2. CREATE NEW BLOCKCHAIN-RELATED TABLES
-- =====================================================

-- Blockchain events log (for syncing on-chain events)
CREATE TABLE IF NOT EXISTS blockchain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  event_type TEXT NOT NULL, -- 'BadgeMinted', 'XPAdded', 'ItemListed', 'ProfileCreated', etc.
  contract_address TEXT NOT NULL,
  event_data JSONB,
  chain_id INTEGER NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tx_hash, event_type)
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_blockchain_events_type ON blockchain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_contract ON blockchain_events(contract_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_processed ON blockchain_events(processed);

-- Token holdings cache (for quick access without RPC calls)
CREATE TABLE IF NOT EXISTS token_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  token_type TEXT NOT NULL, -- 'ERC20', 'ERC721', 'ERC1155'
  balance DECIMAL(36,18),
  token_ids BIGINT[], -- For NFTs (ERC721/ERC1155)
  chain_id INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token_address, chain_id)
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_token_holdings_user ON token_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_token_holdings_token ON token_holdings(token_address);

-- Contract deployments registry
CREATE TABLE IF NOT EXISTS contract_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_name TEXT NOT NULL, -- 'CloddyToken', 'CloddyProfile', etc.
  contract_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  deployment_tx_hash TEXT,
  abi_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  deployed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contract_name, chain_id)
);

-- Insert contract addresses (Base Sepolia - deployed January 2025)
INSERT INTO contract_deployments (contract_name, contract_address, chain_id) VALUES
  ('CloddyToken', '0xf3D72F48B8d3599b942B352f0a9D87995Ad26Ab2', 84532),
  ('CloddyProfile', '0x80c7B4F9f9534CD5a0F6EC4bCcc72BdE0f936d62', 84532),
  ('CloddyBadges', '0xcb179bc42421a52019BEd304f649726c459343AC', 84532),
  ('CloddyReputation', '0x64CE5fC402983A816dA704D1924B90f4fcd1b2FB', 84532),
  ('CloddyMarketplace', '0x4e80eA83b9b40AB63396Ed8F698b2Aaa2A3d8dfF', 84532),
  ('CloddyTokenGate', '0x4A0204B3441a6098f8164c7BEfe3214bfaCa86Db', 84532),
  ('CloddyEquippable', '0x8acB019Ae2231D256b5c439D885A036a46F42ECE', 84532)
ON CONFLICT (contract_name, chain_id) DO UPDATE SET
  contract_address = EXCLUDED.contract_address,
  is_active = true;

-- =====================================================
-- 3. MARKETPLACE TABLES
-- =====================================================

-- Products table (for marketplace items)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(18,8) NOT NULL,
  currency TEXT DEFAULT 'ETH', -- 'ETH', 'CLODDY', 'USDC'
  category TEXT,
  image_urls TEXT[],
  -- NFT-specific fields
  nft_contract_address TEXT,
  nft_token_id BIGINT,
  nft_token_type TEXT, -- 'ERC721', 'ERC1155'
  ipfs_hash TEXT,
  royalty_percentage DECIMAL(5,2) DEFAULT 2.5,
  -- Listing status
  status TEXT DEFAULT 'active', -- 'active', 'sold', 'cancelled'
  listing_id BIGINT, -- On-chain listing ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  price DECIMAL(18,8) NOT NULL,
  currency TEXT NOT NULL,
  -- Blockchain transaction info
  blockchain_tx_hash TEXT,
  escrow_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
  confirmed_at TIMESTAMPTZ,
  -- Order status
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'delivered', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for marketplace queries
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);

-- =====================================================
-- 4. XP/REPUTATION SYNC TABLE
-- =====================================================

-- XP transactions (mirror of on-chain XP)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action_type TEXT, -- 'post_created', 'like_received', 'badge_earned', etc.
  reason TEXT NOT NULL,
  source TEXT DEFAULT 'off_chain', -- 'off_chain', 'on_chain'
  tx_hash TEXT, -- If on-chain
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id);

-- =====================================================
-- 5. UPDATE TRIGGERS
-- =====================================================

-- Function to update user's last_seen_at
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET last_seen_at = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on posts to update last_seen
DROP TRIGGER IF EXISTS update_user_last_seen_on_post ON posts;
CREATE TRIGGER update_user_last_seen_on_post
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_seen();

-- Function to sync XP to users table
CREATE OR REPLACE FUNCTION sync_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET experience_points = experience_points + NEW.amount,
      updated_at = NOW()
  WHERE id = NEW.user_id;

  -- Update level based on XP (100 * level^2 formula)
  UPDATE users
  SET level = (
    SELECT GREATEST(1, FLOOR(SQRT(experience_points / 100)))
  )
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync XP
DROP TRIGGER IF EXISTS sync_xp_to_user ON xp_transactions;
CREATE TRIGGER sync_xp_to_user
  AFTER INSERT ON xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_xp();

-- =====================================================
-- 6. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for user with token holdings
CREATE OR REPLACE VIEW user_with_holdings AS
SELECT
  u.*,
  COALESCE(
    (SELECT json_agg(json_build_object(
      'token_address', th.token_address,
      'token_type', th.token_type,
      'balance', th.balance,
      'token_ids', th.token_ids
    ))
    FROM token_holdings th WHERE th.user_id = u.id),
    '[]'::json
  ) as holdings
FROM users u;

-- View for marketplace listings with seller info
CREATE OR REPLACE VIEW marketplace_listings AS
SELECT
  p.*,
  u.display_name as seller_name,
  u.avatar_url as seller_avatar,
  u.level as seller_level,
  u.wallet_address as seller_wallet
FROM products p
JOIN users u ON p.seller_id = u.id
WHERE p.status = 'active';

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE blockchain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- Blockchain events: admin only
CREATE POLICY "Blockchain events admin only"
  ON blockchain_events
  FOR ALL
  USING (false);

-- Token holdings: users can see their own
CREATE POLICY "Users can view own holdings"
  ON token_holdings
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Products: anyone can view active, sellers can manage own
CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Sellers can manage own products"
  ON products
  FOR ALL
  USING (auth.uid()::text = seller_id::text);

-- Orders: participants can view their orders
CREATE POLICY "Buyers and sellers can view orders"
  ON orders
  FOR SELECT
  USING (
    auth.uid()::text = buyer_id::text OR
    auth.uid()::text = seller_id::text
  );

-- XP transactions: users can view own
CREATE POLICY "Users can view own XP"
  ON xp_transactions
  FOR SELECT
  USING (auth.uid()::text = user_id::text);
