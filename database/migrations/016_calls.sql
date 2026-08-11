-- ============================================
-- 016_calls.sql
-- Voice/video call records
-- ============================================
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    started_by UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(10) CHECK (type IN ('voice','video')),
    status VARCHAR(20) CHECK (status IN ('ongoing','missed','completed','declined','cancelled','failed')),
    ended_reason VARCHAR(30) CHECK (ended_reason IN
        ('completed','declined','timeout','network_error','cancelled')),
    recording_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX idx_calls_conversation ON calls(conversation_id);
CREATE INDEX idx_calls_started_by ON calls(started_by);
