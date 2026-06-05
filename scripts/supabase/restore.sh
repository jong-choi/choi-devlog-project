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

for file in roles.sql schema.sql data.sql; do
  if [[ ! -f "${DUMP_DIR}/${file}" ]]; then
    echo "Missing ${DUMP_DIR}/${file}" >&2
    exit 1
  fi
done

if [[ -z "${SELF_HOSTED_DB_URL:-}" ]]; then
  SELF_HOSTED_DB_HOST="${SELF_HOSTED_DB_HOST:-blog-supabase.jongchoi.com}"
  POSTGRES_DB="${POSTGRES_DB:-postgres}"

  if [[ -z "${POSTGRES_PASSWORD:-}" || -z "${POOLER_TENANT_ID:-}" ]]; then
    echo "SELF_HOSTED_DB_URL is required unless POSTGRES_PASSWORD and POOLER_TENANT_ID are set." >&2
    exit 1
  fi

  SELF_HOSTED_DB_URL="postgres://postgres.${POOLER_TENANT_ID}:${POSTGRES_PASSWORD}@${SELF_HOSTED_DB_HOST}:5432/${POSTGRES_DB}"
fi

psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file "${DUMP_DIR}/roles.sql" \
  --file "${DUMP_DIR}/schema.sql" \
  --command "SET session_replication_role = replica" \
  --file "${DUMP_DIR}/data.sql" \
  --dbname "${SELF_HOSTED_DB_URL}"

echo "Restore completed from ${DUMP_DIR}"
