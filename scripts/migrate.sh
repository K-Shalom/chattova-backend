#!/bin/bash
# ============================================
# scripts/migrate.sh
# Runs Chattova migration files (database/migrations/) in order — but only
# the ones that haven't been applied yet, tracked via schema_migrations.
#
# Usage (from the repo root):
#   ./scripts/migrate.sh
# ============================================

set -e  # stop immediately on a real bash error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$SCRIPT_DIR/../database"

if [ -f "$DB_DIR/.env" ]; then
    export $(grep -v '^#' "$DB_DIR/.env" | xargs)
else
    echo "❌  database/.env not found. Run: cp database/.env.example database/.env — then fill in your values."
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"
PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"

echo "▶ Connecting to database: $DB_NAME (host: $DB_HOST, user: $DB_USER)"
echo ""

for filepath in "$DB_DIR"/migrations/*.sql; do
    filename=$(basename "$filepath")

    # Has this file already been applied? (schema_migrations doesn't exist yet
    # on the very first run — that's fine, the query just returns nothing.)
    already_applied=$($PSQL -tAc "SELECT 1 FROM schema_migrations WHERE filename = '$filename'" 2>/dev/null || echo "")

    if [ "$already_applied" = "1" ]; then
        echo "⏭  Skipping (already applied): $filename"
        continue
    fi

    echo "➡ Running: $filename"
    # ON_ERROR_STOP=1 makes psql actually stop and fail on the first real SQL error,
    # instead of silently continuing (which was the earlier bug).
    $PSQL -v ON_ERROR_STOP=1 -f "$filepath"

    # Record this file as applied (skip this for 000 itself, since the table
    # it creates might not have existed before this exact statement).
    if [ "$filename" != "000_schema_migrations.sql" ]; then
        $PSQL -c "INSERT INTO schema_migrations (filename) VALUES ('$filename') ON CONFLICT DO NOTHING;" > /dev/null
    fi

    echo "✅ Done: $filename"
    echo ""
done

echo "🎉 All migrations are up to date!"
