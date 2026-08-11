-- ============================================
-- 003_devices.sql
-- Registered devices per user (for push notifications & multi-device)
-- ============================================
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(100),
    platform VARCHAR(20),
    push_token TEXT,
    public_key TEXT,
    app_version VARCHAR(20),
    last_ip VARCHAR(45),
    trusted BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, push_token)
);

CREATE INDEX idx_devices_user_id ON devices(user_id);
