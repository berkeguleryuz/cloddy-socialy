-- Function to get user's rank in leaderboard
CREATE OR REPLACE FUNCTION get_user_rank(
  user_id_param UUID,
  order_column TEXT DEFAULT 'experience_points'
)
RETURNS INTEGER AS $$
DECLARE
  user_rank INTEGER;
BEGIN
  IF order_column = 'experience_points' THEN
    SELECT rank INTO user_rank
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY experience_points DESC) as rank
      FROM users
      WHERE deleted_at IS NULL
    ) ranked
    WHERE id = user_id_param;
  ELSIF order_column = 'badges_count' THEN
    SELECT rank INTO user_rank
    FROM (
      SELECT u.id, ROW_NUMBER() OVER (ORDER BY COUNT(ub.id) DESC) as rank
      FROM users u
      LEFT JOIN user_badges ub ON u.id = ub.user_id
      WHERE u.deleted_at IS NULL
      GROUP BY u.id
    ) ranked
    WHERE id = user_id_param;
  ELSIF order_column = 'posts_count' THEN
    SELECT rank INTO user_rank
    FROM (
      SELECT u.id, ROW_NUMBER() OVER (ORDER BY COUNT(p.id) DESC) as rank
      FROM users u
      LEFT JOIN posts p ON u.id = p.author_id AND p.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
      GROUP BY u.id
    ) ranked
    WHERE id = user_id_param;
  ELSE
    SELECT rank INTO user_rank
    FROM (
      SELECT u.id, ROW_NUMBER() OVER (ORDER BY COUNT(f.id) DESC) as rank
      FROM users u
      LEFT JOIN friendships f ON (u.id = f.user_id OR u.id = f.friend_id) AND f.status = 'accepted'
      WHERE u.deleted_at IS NULL
      GROUP BY u.id
    ) ranked
    WHERE id = user_id_param;
  END IF;

  RETURN user_rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Materialized view for faster leaderboard queries (optional, for scale)
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_cache AS
SELECT
  u.id,
  u.display_name,
  u.avatar_url,
  u.level,
  u.wallet_address,
  u.experience_points,
  COALESCE(badge_counts.count, 0) as badges_count,
  COALESCE(post_counts.count, 0) as posts_count,
  COALESCE(friend_counts.count, 0) as friends_count,
  ROW_NUMBER() OVER (ORDER BY u.experience_points DESC) as xp_rank,
  ROW_NUMBER() OVER (ORDER BY COALESCE(badge_counts.count, 0) DESC) as badge_rank,
  ROW_NUMBER() OVER (ORDER BY COALESCE(post_counts.count, 0) DESC) as post_rank,
  ROW_NUMBER() OVER (ORDER BY COALESCE(friend_counts.count, 0) DESC) as friend_rank
FROM users u
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM user_badges
  GROUP BY user_id
) badge_counts ON u.id = badge_counts.user_id
LEFT JOIN (
  SELECT author_id, COUNT(*) as count
  FROM posts
  WHERE deleted_at IS NULL
  GROUP BY author_id
) post_counts ON u.id = post_counts.author_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM (
    SELECT user_id FROM friendships WHERE status = 'accepted'
    UNION ALL
    SELECT friend_id FROM friendships WHERE status = 'accepted'
  ) all_friends
  GROUP BY user_id
) friend_counts ON u.id = friend_counts.user_id
WHERE u.deleted_at IS NULL;

-- Index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_cache_id ON leaderboard_cache(id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_xp_rank ON leaderboard_cache(xp_rank);

-- Function to refresh leaderboard cache (call periodically)
CREATE OR REPLACE FUNCTION refresh_leaderboard_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_cache;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add count columns to users table for denormalized access
ALTER TABLE users ADD COLUMN IF NOT EXISTS badges_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS friends_count INTEGER DEFAULT 0;

-- Create triggers to keep counts updated
CREATE OR REPLACE FUNCTION update_user_badges_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET badges_count = badges_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET badges_count = badges_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET posts_count = posts_count + 1 WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    UPDATE users SET posts_count = GREATEST(0, posts_count - 1) WHERE id = COALESCE(OLD.author_id, NEW.author_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_friends_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE users SET friends_count = friends_count + 1 WHERE id IN (NEW.user_id, NEW.friend_id);
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    UPDATE users SET friends_count = friends_count + 1 WHERE id IN (NEW.user_id, NEW.friend_id);
  ELSIF TG_OP = 'UPDATE' AND NEW.status != 'accepted' AND OLD.status = 'accepted' THEN
    UPDATE users SET friends_count = GREATEST(0, friends_count - 1) WHERE id IN (NEW.user_id, NEW.friend_id);
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE users SET friends_count = GREATEST(0, friends_count - 1) WHERE id IN (OLD.user_id, OLD.friend_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trg_user_badges_count ON user_badges;
CREATE TRIGGER trg_user_badges_count
  AFTER INSERT OR DELETE ON user_badges
  FOR EACH ROW EXECUTE FUNCTION update_user_badges_count();

DROP TRIGGER IF EXISTS trg_user_posts_count ON posts;
CREATE TRIGGER trg_user_posts_count
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON posts
  FOR EACH ROW EXECUTE FUNCTION update_user_posts_count();

DROP TRIGGER IF EXISTS trg_user_friends_count ON friendships;
CREATE TRIGGER trg_user_friends_count
  AFTER INSERT OR UPDATE OR DELETE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_user_friends_count();
