#!/bin/bash
set -e

# Load env vars
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

PROJECT_ID="jnaheqpnidqhyarpymbs"
SQL_FILE="/tmp/mlb-daily-hub-schema.sql"

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not found"
  exit 1
fi

echo "Applying schema via Supabase Management API..."

# Read SQL file and escape for JSON
SQL_CONTENT=$(cat "$SQL_FILE" | jq -Rs .)

# Execute via Supabase's query endpoint
curl -X POST \
  "https://${PROJECT_ID}.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": ${SQL_CONTENT}}"

echo ""
echo "✅ Schema application attempted"
echo "⚠️  If this fails, apply manually via SQL Editor:"
echo "   https://supabase.com/dashboard/project/${PROJECT_ID}/sql/new"
