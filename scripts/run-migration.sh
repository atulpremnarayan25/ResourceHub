#!/usr/bin/env bash
set -e

if [ ! -f .env.local ]; then
  echo "Error: .env.local not found."
  exit 1
fi

export $(grep -E '^POSTGRES_PASSWORD=' .env.local | xargs)
export PGHOST="aws-0-ap-south-1.pooler.supabase.com"
export PGUSER="postgres.iqdlflgizeucayedkpjo"
export PGPASSWORD="$POSTGRES_PASSWORD"
export PGDATABASE="postgres"
export PGPORT=6543
export PGSSLMODE=require

echo "Executing Supabase SQL migration via psql (Supabase Pooler: $PGHOST)..."
psql -f supabase/complete_setup.sql
echo "Migration execution completed successfully."
