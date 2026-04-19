-- Cloddy PFP + Username NFT tracking
-- Mirrors on-chain state for fast reads (avoid hitting RPC on every render).
-- ================================================================

-- --- PFP NFTs ---
CREATE TABLE IF NOT EXISTS pfp_nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  tx_hash TEXT,
  image_url TEXT NOT NULL,
  metadata_url TEXT NOT NULL,
  mint_fee_wei TEXT,
  minted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (contract_address, token_id, chain_id)
);

CREATE INDEX IF NOT EXISTS pfp_nfts_owner_address_idx ON pfp_nfts (owner_address);
CREATE INDEX IF NOT EXISTS pfp_nfts_owner_id_idx ON pfp_nfts (owner_id);

-- --- Username NFTs ---
CREATE TABLE IF NOT EXISTS username_nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  tx_hash TEXT,
  tld TEXT NOT NULL,
  label TEXT NOT NULL, -- lowercased, unique per TLD
  display TEXT NOT NULL, -- original casing
  metadata_url TEXT NOT NULL,
  mint_fee_wei TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  minted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (chain_id, contract_address, tld, label),
  UNIQUE (contract_address, token_id, chain_id)
);

CREATE INDEX IF NOT EXISTS username_nfts_owner_address_idx ON username_nfts (owner_address);
CREATE INDEX IF NOT EXISTS username_nfts_owner_id_idx ON username_nfts (owner_id);
CREATE INDEX IF NOT EXISTS username_nfts_tld_label_idx ON username_nfts (tld, label);

-- Ensure at most one primary per owner.
CREATE UNIQUE INDEX IF NOT EXISTS username_nfts_primary_per_owner_idx
  ON username_nfts (owner_address)
  WHERE is_primary = TRUE;

-- Link primary PFP / username on users table (nullable, updated by triggers or server).
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS primary_pfp_nft_id UUID REFERENCES pfp_nfts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_username_nft_id UUID REFERENCES username_nfts(id) ON DELETE SET NULL;

-- RLS — PFP NFTs are publicly readable; only owner writes are allowed through the API layer.
ALTER TABLE pfp_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE username_nfts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pfp_nfts_read_all" ON pfp_nfts;
CREATE POLICY "pfp_nfts_read_all" ON pfp_nfts FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "username_nfts_read_all" ON username_nfts;
CREATE POLICY "username_nfts_read_all" ON username_nfts FOR SELECT USING (TRUE);

-- Writes go through server-side admin client only (service role bypasses RLS).
