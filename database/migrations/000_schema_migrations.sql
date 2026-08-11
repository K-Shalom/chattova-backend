-- ============================================
-- 000_schema_migrations.sql
-- Tracks which migration files have already been applied, so running the
-- migration script again never tries to re-create tables that already exist.
-- This file always runs first (000 sorts before 001).
-- ============================================
CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
