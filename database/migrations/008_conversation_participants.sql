-- ============================================
-- 008_conversation_participants.sql
-- Membership + role + moderation state per user per conversation
-- NOTE: last_read_message_id is added later in 010, once messages exists
-- (this resolves the circular dependency between this table and messages)
-- ============================================
CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin','moderator','member','guest')),
    nickname VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','ghosted','suspended','left','removed')),
    restricted_until TIMESTAMP WITH TIME ZONE,
    restricted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    restricted_reason TEXT,
    is_silent BOOLEAN DEFAULT FALSE,
    muted_until TIMESTAMP WITH TIME ZONE,
    joined_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (conversation_id, user_id),
    CHECK (restricted_until IS NULL OR restricted_until >= joined_at)
);

CREATE INDEX idx_conversation_members ON conversation_participants(user_id);
CREATE INDEX idx_participants_restricted ON conversation_participants(restricted_until)
    WHERE restricted_until IS NOT NULL;
