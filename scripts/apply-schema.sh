#!/bin/bash
set -e

# Load env vars
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Extract DB connection details from Supabase URL
DB_HOST="db.jnaheqpnidqhyarpymbs.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"

if [ -z "$DB_PASSWORD" ]; then
  echo "⚠️  SUPABASE_DB_PASSWORD not found in .env.local"
  echo "Get it from: https://supabase.com/dashboard/project/jnaheqpnidqhyarpymbs/settings/database"
  exit 1
fi

echo "Applying schema to Supabase via psql..."

PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f /tmp/mlb-daily-hub-schema.sql

echo "✅ Schema applied successfully"
