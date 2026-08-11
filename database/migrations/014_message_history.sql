-- ============================================
-- 014_message_history.sql
-- Stores previous text content whenever a message is edited
-- ============================================
CREATE TABLE message_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    old_content TEXT,
    edited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_message_id ON message_history(message_id);
