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

if [[ -z "${CLOUD_DB_URL:-}" ]]; then
  echo "CLOUD_DB_URL is required." >&2
  echo "Example: CLOUD_DB_URL='postgres://...' scripts/supabase/dump.sh" >&2
  exit 1
fi

mkdir -p "${DUMP_DIR}"

npx supabase db dump --db-url "${CLOUD_DB_URL}" -f "${DUMP_DIR}/roles.sql" --role-only
npx supabase db dump --db-url "${CLOUD_DB_URL}" -f "${DUMP_DIR}/schema.sql"
npx supabase db dump --db-url "${CLOUD_DB_URL}" -f "${DUMP_DIR}/data.sql" --use-copy --data-only

if command -v psql >/dev/null 2>&1; then
  psql "${CLOUD_DB_URL}" --no-align --tuples-only --set ON_ERROR_STOP=1 > "${DUMP_DIR}/source-inventory.txt" <<'SQL'
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
else
  echo "psql not found; skipped source inventory report." >&2
fi

echo "Dump files written to ${DUMP_DIR}"
