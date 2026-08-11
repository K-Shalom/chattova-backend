-- ============================================
-- 010_add_last_read_message_fk.sql
-- Resolves the circular dependency:
-- conversation_participants needed messages to exist first.
-- ============================================
ALTER TABLE conversation_participants
ADD COLUMN last_read_message_id UUID;

ALTER TABLE conversation_participants
ADD CONSTRAINT fk_last_read_message
FOREIGN KEY (last_read_message_id)
REFERENCES messages(id)
ON DELETE SET NULL;
