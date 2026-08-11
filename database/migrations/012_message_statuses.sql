-- ============================================
-- 012_message_statuses.sql
-- Per-user delivery/read receipts for each message
-- ============================================
CREATE TABLE message_statuses (
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    received_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (message_id, user_id),
    CONSTRAINT read_after_delivered CHECK (read_at IS NULL OR delivered_at IS NULL OR read_at >= delivered_at)
);

CREATE INDEX idx_status_user ON message_statuses(user_id);
