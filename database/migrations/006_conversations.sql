-- ============================================
-- 006_conversations.sql
-- Single table for direct/group/channel/community/bot conversations (ADR-008)
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'channel', 'community', 'bot')),
    name VARCHAR(100),
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT named_conversation_types CHECK (type = 'direct' OR name IS NOT NULL)
);
