-- Full-Text Search Migration
-- Adds tsvector columns and GIN indexes for fast full-text search

-- Add search vectors to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(display_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(username, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(bio, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(tagline, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_users_search ON users USING GIN (search_vector);

-- Add search vectors to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(content, '')), 'A')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN (search_vector);

-- Add search vectors to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_groups_search ON groups USING GIN (search_vector);

-- Add search vectors to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_events_search ON events USING GIN (search_vector);

-- Add soft delete columns to main tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_deleted ON posts (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_groups_deleted ON groups (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_deleted ON events (deleted_at) WHERE deleted_at IS NULL;

-- Function for fuzzy search using trigrams (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram indexes for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING GIN (display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_groups_name_trgm ON groups USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_events_title_trgm ON events USING GIN (title gin_trgm_ops);

-- Helper function for combined search
CREATE OR REPLACE FUNCTION search_all(search_query TEXT, result_limit INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  image_url TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- Search users
    SELECT
      u.id,
      'user'::TEXT as type,
      u.display_name as title,
      u.bio as description,
      u.avatar_url as image_url,
      ts_rank(u.search_vector, plainto_tsquery('english', search_query)) as rank
    FROM users u
    WHERE u.search_vector @@ plainto_tsquery('english', search_query)
      AND u.deleted_at IS NULL

    UNION ALL

    -- Search posts
    SELECT
      p.id,
      'post'::TEXT as type,
      LEFT(p.content, 100) as title,
      p.content as description,
      NULL as image_url,
      ts_rank(p.search_vector, plainto_tsquery('english', search_query)) as rank
    FROM posts p
    WHERE p.search_vector @@ plainto_tsquery('english', search_query)
      AND p.deleted_at IS NULL

    UNION ALL

    -- Search groups
    SELECT
      g.id,
      'group'::TEXT as type,
      g.name as title,
      g.description as description,
      g.avatar_url as image_url,
      ts_rank(g.search_vector, plainto_tsquery('english', search_query)) as rank
    FROM groups g
    WHERE g.search_vector @@ plainto_tsquery('english', search_query)
      AND g.deleted_at IS NULL

    UNION ALL

    -- Search events
    SELECT
      e.id,
      'event'::TEXT as type,
      e.title as title,
      e.description as description,
      e.image_url as image_url,
      ts_rank(e.search_vector, plainto_tsquery('english', search_query)) as rank
    FROM events e
    WHERE e.search_vector @@ plainto_tsquery('english', search_query)
      AND e.deleted_at IS NULL
  ) combined
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
