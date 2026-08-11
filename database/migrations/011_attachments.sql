-- ============================================
-- 011_attachments.sql
-- Files/media attached to a message (hard delete via ON DELETE CASCADE)
-- ============================================
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT CHECK (size_bytes >= 0),
    duration_seconds INT CHECK (duration_seconds >= 0),
    width INT,
    height INT,
    checksum VARCHAR(64),
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB, -- camera, bitrate, codec, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_message_id ON attachments(message_id);
