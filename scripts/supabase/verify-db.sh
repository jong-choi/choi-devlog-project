#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${ENV_FILE:-${REPO_ROOT}/infra/supabase/.env}"
DUMP_DIR="${DUMP_DIR:-${REPO_ROOT}/infra/supabase/dumps/latest}"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required." >&2
  exit 1
fi

if [[ -z "${SELF_HOSTED_DB_URL:-}" ]]; then
  SELF_HOSTED_DB_HOST="${SELF_HOSTED_DB_HOST:-blog-supabase.jongchoi.com}"
  POSTGRES_DB="${POSTGRES_DB:-postgres}"
  POSTGRES_PORT="${POSTGRES_PORT:-5432}"

  if [[ -z "${POSTGRES_PASSWORD:-}" || -z "${POOLER_TENANT_ID:-}" ]]; then
    echo "SELF_HOSTED_DB_URL is required unless POSTGRES_PASSWORD and POOLER_TENANT_ID are set." >&2
    exit 1
  fi

  SELF_HOSTED_DB_URL="postgres://postgres.${POOLER_TENANT_ID}:${POSTGRES_PASSWORD}@${SELF_HOSTED_DB_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi

REPORT_FILE="${REPORT_FILE:-${DUMP_DIR}/self-hosted-inventory.txt}"
mkdir -p "$(dirname "${REPORT_FILE}")"

psql "${SELF_HOSTED_DB_URL}" --no-align --tuples-only --set ON_ERROR_STOP=1 > "${REPORT_FILE}" <<'SQL'
select 'extensions';
select extname from pg_extension order by extname;

select 'public_tables';
select tablename from pg_tables where schemaname = 'public' order by tablename;

select 'public_views';
select viewname from pg_views where schemaname = 'public' order by viewname;

select 'public_functions';
select proname from pg_proc where pronamespace = 'public'::regnamespace order by proname;

select 'public_triggers';
select event_object_table || '.' || trigger_name
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;

select 'policies';
select schemaname || '.' || tablename || '.' || policyname
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

select 'auth_users_count';
select count(*)::text from auth.users;

select 'storage_buckets';
select id || ':' || name || ':' || public::text from storage.buckets order by name;
SQL

echo "Self-hosted inventory written to ${REPORT_FILE}"

if [[ -f "${DUMP_DIR}/source-inventory.txt" ]]; then
  if diff -u "${DUMP_DIR}/source-inventory.txt" "${REPORT_FILE}"; then
    echo "Source and self-hosted inventories match."
  else
    echo "Inventory mismatch detected. Review the diff above." >&2
    exit 1
  fi
else
  echo "No source inventory found at ${DUMP_DIR}/source-inventory.txt; skipped diff."
fi
