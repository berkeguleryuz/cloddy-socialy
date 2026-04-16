-- XP Transactions Table for tracking XP history
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  metadata JSONB,
  previous_xp INTEGER,
  new_xp INTEGER,
  leveled_up BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for XP transactions
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_source ON xp_transactions(source);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at DESC);

-- Add quest claiming columns to user_quests
ALTER TABLE user_quests ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE;
ALTER TABLE user_quests ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE user_quests ADD COLUMN IF NOT EXISTS last_reset TIMESTAMPTZ;

-- Add index for unclaimed completed quests
CREATE INDEX IF NOT EXISTS idx_user_quests_claimable
ON user_quests(user_id)
WHERE completed = TRUE AND claimed = FALSE;

-- Create function to auto-update progress
CREATE OR REPLACE FUNCTION update_quest_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if progress meets target
  IF NEW.progress >= (
    SELECT target FROM quests WHERE id = NEW.quest_id
  ) THEN
    NEW.completed := TRUE;
    NEW.completed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-completion
DROP TRIGGER IF EXISTS trg_quest_progress ON user_quests;
CREATE TRIGGER trg_quest_progress
  BEFORE UPDATE OF progress ON user_quests
  FOR EACH ROW
  EXECUTE FUNCTION update_quest_progress();

-- Add RLS policies for xp_transactions
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own XP transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can insert XP transactions"
  ON xp_transactions FOR INSERT
  WITH CHECK (TRUE);

-- Ensure users have experience_points and level columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Create index for leaderboard
CREATE INDEX IF NOT EXISTS idx_users_xp_ranking
ON users(experience_points DESC)
WHERE deleted_at IS NULL;

-- Add completed_at to user_quests for tracking
ALTER TABLE user_quests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
