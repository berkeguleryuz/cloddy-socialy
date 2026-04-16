-- Cloddy Web2 Auth & Admin Panel Migration
-- This migration adds support for email/password authentication and admin functionality

-- =====================================================
-- 1. USERS TABLE UPDATES FOR WEB2 AUTH
-- =====================================================

-- Make wallet_address nullable for email-only users
ALTER TABLE users ALTER COLUMN wallet_address DROP NOT NULL;

-- Add Web2 auth columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'web3'; -- 'web3', 'email', 'both'
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Index for email verification token lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_auth_method ON users(auth_method);

-- =====================================================
-- 2. USER ROLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'moderator', 'admin', 'super_admin'
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Indexes for role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'super_admin'
    )
  );

-- =====================================================
-- 3. CONTENT REPORTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL, -- 'post', 'comment', 'user', 'group', 'event'
  content_id UUID NOT NULL,
  reason TEXT NOT NULL, -- 'spam', 'harassment', 'inappropriate', 'misinformation', 'other'
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_content ON content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);

-- Enable RLS
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_reports
CREATE POLICY "Users can create reports"
  ON content_reports FOR INSERT
  WITH CHECK (reporter_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own reports"
  ON content_reports FOR SELECT
  USING (reporter_id = (SELECT auth.uid()));

CREATE POLICY "Moderators can view all reports"
  ON content_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('moderator', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Moderators can update reports"
  ON content_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- =====================================================
-- 4. USER SUSPENSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_suspensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  suspended_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  suspension_type TEXT NOT NULL, -- 'warning', 'temporary', 'permanent'
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ, -- NULL for permanent
  is_active BOOLEAN DEFAULT TRUE,
  lifted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  lifted_at TIMESTAMPTZ,
  lift_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for suspensions
CREATE INDEX IF NOT EXISTS idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_active ON user_suspensions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_suspensions_ends_at ON user_suspensions(ends_at) WHERE ends_at IS NOT NULL AND is_active = TRUE;

-- Enable RLS
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_suspensions
CREATE POLICY "Users can view their own suspensions"
  ON user_suspensions FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Moderators can view all suspensions"
  ON user_suspensions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('moderator', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage suspensions"
  ON user_suspensions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 5. AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'user_suspended', 'role_assigned', 'content_deleted', etc.
  target_type TEXT, -- 'user', 'post', 'comment', 'group', 'badge', 'quest', 'setting'
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit_logs (only admins can view)
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- Allow inserts from backend/service role

-- =====================================================
-- 6. SYSTEM SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general', -- 'general', 'auth', 'moderation', 'gamification', 'notifications'
  is_public BOOLEAN DEFAULT FALSE, -- Whether this setting is exposed to frontend
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for system_settings
CREATE POLICY "Public settings are viewable by everyone"
  ON system_settings FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Admins can view all settings"
  ON system_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can manage settings"
  ON system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'super_admin'
    )
  );

-- =====================================================
-- 7. EMAIL SESSIONS TABLE (for email auth)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  is_valid BOOLEAN DEFAULT TRUE
);

-- Indexes for email sessions
CREATE INDEX IF NOT EXISTS idx_email_sessions_user_id ON email_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sessions_token_hash ON email_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_sessions_expires ON email_sessions(expires_at);

-- Enable RLS
ALTER TABLE email_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own sessions"
  ON email_sessions FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own sessions"
  ON email_sessions FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to check if a user is suspended
CREATE OR REPLACE FUNCTION is_user_suspended(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_suspensions
    WHERE user_id = check_user_id
    AND is_active = TRUE
    AND (ends_at IS NULL OR ends_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has admin privileges (admin or super_admin)
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has moderation privileges
CREATE OR REPLACE FUNCTION is_moderator(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id
    AND role IN ('moderator', 'admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire temporary suspensions
CREATE OR REPLACE FUNCTION expire_temporary_suspensions()
RETURNS void AS $$
BEGIN
  UPDATE user_suspensions
  SET is_active = FALSE
  WHERE suspension_type = 'temporary'
  AND ends_at IS NOT NULL
  AND ends_at < NOW()
  AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired email sessions
CREATE OR REPLACE FUNCTION cleanup_expired_email_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM email_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record audit log (for backend use)
CREATE OR REPLACE FUNCTION record_audit_log(
  p_actor_id UUID,
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata, ip_address, user_agent)
  VALUES (p_actor_id, p_action, p_target_type, p_target_id, p_metadata, p_ip_address, p_user_agent)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. DEFAULT SYSTEM SETTINGS
-- =====================================================

INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('auth.require_email_verification', 'true', 'Require email verification before login', 'auth', false),
  ('auth.max_login_attempts', '5', 'Maximum login attempts before lockout', 'auth', false),
  ('auth.lockout_duration_minutes', '15', 'Account lockout duration in minutes', 'auth', false),
  ('auth.password_min_length', '8', 'Minimum password length', 'auth', true),
  ('auth.session_duration_days', '7', 'Session duration in days', 'auth', false),
  ('moderation.auto_flag_threshold', '3', 'Reports needed to auto-flag content', 'moderation', false),
  ('gamification.xp_per_post', '10', 'XP awarded for creating a post', 'gamification', true),
  ('gamification.xp_per_like_received', '2', 'XP awarded when receiving a like', 'gamification', true),
  ('gamification.xp_per_comment_received', '5', 'XP awarded when receiving a comment', 'gamification', true),
  ('notifications.email_enabled', 'true', 'Enable email notifications', 'notifications', false),
  ('platform.maintenance_mode', 'false', 'Platform maintenance mode', 'general', true),
  ('platform.registration_enabled', 'true', 'Allow new user registrations', 'general', true)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 10. UPDATE TIMESTAMP TRIGGER FOR NEW TABLES
-- =====================================================

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. GRANT PERMISSIONS FOR SERVICE ROLE
-- =====================================================

-- These grants allow the service role (backend) to bypass RLS
-- The service role is used by the API routes

-- Grant permissions on new tables
GRANT ALL ON user_roles TO service_role;
GRANT ALL ON content_reports TO service_role;
GRANT ALL ON user_suspensions TO service_role;
GRANT ALL ON audit_logs TO service_role;
GRANT ALL ON system_settings TO service_role;
GRANT ALL ON email_sessions TO service_role;
