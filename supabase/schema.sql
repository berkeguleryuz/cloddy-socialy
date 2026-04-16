-- Cloddy Database Schema for Supabase
-- Run this in the Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

-- Users table (wallet-based identity)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  ens_name TEXT,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  tagline TEXT,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  city TEXT,
  country TEXT,
  birthday DATE,
  occupation TEXT,
  status TEXT, -- 'single', 'relationship', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  profile_completion INTEGER DEFAULT 0
);

-- User interests/metadata
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'tv_shows', 'music', 'movies', 'books', 'games'
  values TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User social links
CREATE TABLE IF NOT EXISTS user_social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'twitch', 'discord', 'website'
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SIWE sessions
CREATE TABLE IF NOT EXISTS siwe_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE
);

-- Nonces for SIWE (temporary, for verification)
CREATE TABLE IF NOT EXISTS siwe_nonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nonce TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- =====================================================
-- 2. SOCIAL RELATIONSHIPS
-- =====================================================

-- Friends/Following system (bidirectional friendships)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- =====================================================
-- 3. POSTS & CONTENT
-- =====================================================

-- Posts (supports text, video, gallery, poll types)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'video', 'gallery', 'poll'
  content TEXT,
  visibility TEXT DEFAULT 'public', -- 'public', 'friends', 'private'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0
);

-- Post media (images, videos)
CREATE TABLE IF NOT EXISTS post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'image', 'video'
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  duration TEXT, -- for videos
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll options (for poll posts)
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  votes_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0
);

-- Poll votes
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_option_id, user_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- for nested replies
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0
);

-- Likes for posts (simple version matching API)
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Comment likes (separate table for comment reactions)
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like', -- 'like', 'love', 'laugh', 'wow', 'sad', 'angry'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- Shares
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  share_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. GROUPS
-- =====================================================

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  category TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  members_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'moderator', 'member'
  status TEXT DEFAULT 'active', -- 'pending', 'active', 'banned'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Group posts (links posts to groups)
CREATE TABLE IF NOT EXISTS group_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. EVENTS
-- =====================================================

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  location TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_date DATE,
  end_time TIME,
  organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  is_online BOOLEAN DEFAULT FALSE,
  online_url TEXT,
  max_participants INTEGER,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event participants (renamed for consistency with API)
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'interested', -- 'interested', 'going', 'not_going'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- =====================================================
-- 6. BADGES & GAMIFICATION
-- =====================================================

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT NOT NULL,
  experience_points INTEGER DEFAULT 0,
  category TEXT, -- 'social', 'content', 'community', 'achievement'
  requirements JSONB, -- flexible requirements storage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges (earned)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Quests
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  experience_reward INTEGER DEFAULT 0,
  badge_reward_id UUID REFERENCES badges(id),
  quest_type TEXT, -- 'daily', 'weekly', 'one_time'
  requirements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User quest progress
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'expired'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, quest_id)
);

-- =====================================================
-- 7. MARKETPLACE
-- =====================================================

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_digital BOOLEAN DEFAULT TRUE,
  rating DECIMAL(2, 1) DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled', 'refunded'
  payment_tx_hash TEXT, -- blockchain transaction hash
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- =====================================================
-- 8. NOTIFICATIONS & ACTIVITY
-- =====================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'friend_request', 'like', 'comment', 'mention', 'badge', 'group_invite'
  title TEXT NOT NULL,
  message TEXT,
  data JSONB, -- flexible additional data
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'post_created', 'joined_group', 'earned_badge', etc.
  target_type TEXT, -- 'post', 'group', 'badge', 'user'
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. INDEXES (Following Supabase Best Practices)
-- =====================================================

-- User lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Posts - author and timeline queries
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_created ON posts(visibility, created_at DESC);

-- Comments - FK index and post queries
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Likes - FK indexes
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Friendships - both directions need index
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status) WHERE status = 'pending';

-- Groups - FK indexes
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_owner ON groups(owner_id);

-- Events - FK indexes and date queries
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);

-- Notifications - user + read status for filtering
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;

-- Messages - both sender and recipient need index
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread ON messages(recipient_id) WHERE is_read = false;

-- SIWE nonces
CREATE INDEX IF NOT EXISTS idx_siwe_nonces_nonce ON siwe_nonces(nonce);
CREATE INDEX IF NOT EXISTS idx_siwe_nonces_expires ON siwe_nonces(expires_at);

-- User badges - FK indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);

-- User quests - FK indexes
CREATE INDEX IF NOT EXISTS idx_user_quests_user ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest ON user_quests(quest_id);

-- Products and orders
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (Optimized per Supabase Best Practices)
-- Using (SELECT auth.uid()) wrapper for better performance
-- =====================================================

-- Users policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = (SELECT auth.uid()));

-- Posts policies
CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT
  USING (visibility = 'public' OR author_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (author_id = (SELECT auth.uid()));

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create likes"
  ON likes FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Friendships policies
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (requester_id = (SELECT auth.uid()) OR addressee_id = (SELECT auth.uid()));

CREATE POLICY "Users can create friend requests"
  ON friendships FOR INSERT
  WITH CHECK (requester_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own friendships"
  ON friendships FOR UPDATE
  USING (requester_id = (SELECT auth.uid()) OR addressee_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  USING (requester_id = (SELECT auth.uid()) OR addressee_id = (SELECT auth.uid()));

-- Groups policies
CREATE POLICY "Public groups are viewable by everyone"
  ON groups FOR SELECT
  USING (is_private = false OR owner_id = (SELECT auth.uid()));

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can update groups"
  ON groups FOR UPDATE
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can delete groups"
  ON groups FOR DELETE
  USING (owner_id = (SELECT auth.uid()));

-- Group memberships policies
CREATE POLICY "Members can view group memberships"
  ON group_memberships FOR SELECT
  USING (true);

CREATE POLICY "Users can join groups"
  ON group_memberships FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can leave groups"
  ON group_memberships FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Messages policies
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (sender_id = (SELECT auth.uid()) OR recipient_id = (SELECT auth.uid()));

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own sent messages"
  ON messages FOR DELETE
  USING (sender_id = (SELECT auth.uid()));

-- =====================================================
-- 11. FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired nonces
CREATE OR REPLACE FUNCTION cleanup_expired_nonces()
RETURNS void AS $$
BEGIN
    DELETE FROM siwe_nonces WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- =====================================================
-- 12. SEED DATA (Optional)
-- =====================================================

-- Insert default badges
INSERT INTO badges (name, description, image_url, experience_points, category) VALUES
  ('Newcomer', 'Welcome to Cloddy!', '/images/badges/newcomer.png', 10, 'achievement'),
  ('Social Butterfly', 'Made 10 friends', '/images/badges/social_butterfly.png', 50, 'social'),
  ('Content Creator', 'Created 5 posts', '/images/badges/content_creator.png', 30, 'content'),
  ('Community Leader', 'Joined 3 groups', '/images/badges/community_leader.png', 40, 'community'),
  ('Verified', 'Verified account', '/images/badges/verified.png', 100, 'achievement')
ON CONFLICT (name) DO NOTHING;

-- Insert default quests
INSERT INTO quests (title, description, experience_reward, quest_type, requirements) VALUES
  ('Welcome Quest', 'Complete your profile', 50, 'one_time', '{"profile_completion": 50}'),
  ('Social Start', 'Add your first friend', 20, 'one_time', '{"friends_count": 1}'),
  ('First Post', 'Create your first post', 30, 'one_time', '{"posts_count": 1}'),
  ('Daily Check-in', 'Log in today', 5, 'daily', '{"login": true}')
ON CONFLICT DO NOTHING;
