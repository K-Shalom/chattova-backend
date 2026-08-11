-- ============================================
-- 019_moderation_actions.sql
-- Audit log of every moderation action taken
-- ============================================
CREATE TABLE moderation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN
        ('ghost','suspend','mute','kick','ban','promote','demote','lifted_early','expired')),
    reason TEXT,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    duration_seconds INT CHECK (duration_seconds >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_target_user ON moderation_actions(target_user_id);
