-- ============================================
-- 007_conversation_invites.sql
-- Invite links for joining a conversation/group
-- ============================================
CREATE TABLE conversation_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    max_uses INT,
    use_count INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (max_uses IS NULL OR max_uses > 0),
    CHECK (use_count >= 0)
);

CREATE INDEX idx_invites_code ON conversation_invites(code);
CREATE INDEX idx_invites_conversation ON conversation_invites(conversation_id);
