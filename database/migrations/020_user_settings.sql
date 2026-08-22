-- ============================================
-- 020_user_settings.sql
-- Stores all synced user preferences (appearance, notifications, privacy,
-- calls, chats, local-mode preference) as a single JSONB blob per user.
-- JSONB is used instead of many separate columns because these settings
-- grow/change often as the app evolves — adding a new setting later never
-- requires another migration, just a new key in the JSON.
-- ============================================
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_settings_preferences ON user_settings USING GIN (preferences);
