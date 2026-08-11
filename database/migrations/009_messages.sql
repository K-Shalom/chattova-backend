-- ============================================
-- 009_messages.sql
-- Core messages table. Client may generate its own UUID (offline-first, ADR-010);
-- server generates one if absent.
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN
        ('text','image','video','audio','voice_note','file','system','location','contact','poll')),
    content TEXT,
    edited BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,        -- client-side timestamp (offline-first)
    server_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- authoritative arrival time
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, server_created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
