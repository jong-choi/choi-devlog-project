#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${ENV_FILE:-${REPO_ROOT}/infra/supabase/.env}"
BUCKET="${BUCKET:-image}"
SELF_HOSTED_S3_ENDPOINT="${SELF_HOSTED_S3_ENDPOINT:-https://blog-supabase.jongchoi.com/storage/v1/s3}"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

required_vars=(
  PLATFORM_S3_ENDPOINT
  PLATFORM_S3_REGION
  PLATFORM_S3_ACCESS_KEY_ID
  PLATFORM_S3_SECRET_ACCESS_KEY
  S3_PROTOCOL_ACCESS_KEY_ID
  S3_PROTOCOL_ACCESS_KEY_SECRET
  REGION
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "${var} is required." >&2
    exit 1
  fi
done

if ! command -v rclone >/dev/null 2>&1; then
  echo "rclone is required." >&2
  exit 1
fi

RCLONE_CONFIG_FILE="$(mktemp)"
trap 'rm -f "${RCLONE_CONFIG_FILE}"' EXIT

cat > "${RCLONE_CONFIG_FILE}" <<EOF
[platform]
type = s3
provider = Other
access_key_id = ${PLATFORM_S3_ACCESS_KEY_ID}
secret_access_key = ${PLATFORM_S3_SECRET_ACCESS_KEY}
endpoint = ${PLATFORM_S3_ENDPOINT}
region = ${PLATFORM_S3_REGION}

[self-hosted]
type = s3
provider = Other
access_key_id = ${S3_PROTOCOL_ACCESS_KEY_ID}
secret_access_key = ${S3_PROTOCOL_ACCESS_KEY_SECRET}
endpoint = ${SELF_HOSTED_S3_ENDPOINT}
region = ${REGION}
EOF

if [[ "${BUCKET}" == "all" ]]; then
  while IFS= read -r bucket; do
    bucket="${bucket%/}"
    [[ -z "${bucket}" ]] && continue
    rclone --config "${RCLONE_CONFIG_FILE}" copy "platform:${bucket}" "self-hosted:${bucket}" --progress --transfers "${TRANSFERS:-4}" --checkers "${CHECKERS:-8}"
  done < <(rclone --config "${RCLONE_CONFIG_FILE}" lsf platform:)
else
  rclone --config "${RCLONE_CONFIG_FILE}" copy "platform:${BUCKET}" "self-hosted:${BUCKET}" --progress --transfers "${TRANSFERS:-4}" --checkers "${CHECKERS:-8}"
fi

echo "Storage sync completed for bucket: ${BUCKET}"
