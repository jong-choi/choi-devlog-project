
FROM node:20-bookworm-slim AS base

# onnxruntime-node가 필요로 하는 런타임 라이브러리 설치 (glibc 포함 이미지에서 동작)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libgomp1 \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# 1단계 : 빌드
FROM base AS builder

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Hugging Face 캐시 디렉토리 (빌드 시 사전 다운로드용)
ENV TRANSFORMERS_CACHE=/opt/hf-cache
RUN mkdir -p ${TRANSFORMERS_CACHE}

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
  fi

# 모델 사전 다운로드 스크립트
COPY scripts/preload-hf-models.mjs ./scripts/preload-hf-models.mjs

# 사전 다운로드 시 사용할 옵션 (필요 시 빌드 인자 제공)
ARG HF_EMBEDDING_MODEL_ID
ENV HF_EMBEDDING_MODEL_ID=${HF_EMBEDDING_MODEL_ID}
ARG HF_RERANKER_MODEL_ID
ENV HF_RERANKER_MODEL_ID=${HF_RERANKER_MODEL_ID}

# 원격 허용 (사전 다운로드 단계)
ENV HF_ALLOW_REMOTE_MODELS=true

# 모델 사전 다운로드 수행
RUN node scripts/preload-hf-models.mjs

# 나머지 앱 코드 복사
COPY . .

ARG NEXT_PUBLIC_ENV_VARIABLE
ENV NEXT_PUBLIC_ENV_VARIABLE=${NEXT_PUBLIC_ENV_VARIABLE}
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ARG SUPABASE_SERVICE_ROLE_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ARG NEXT_PUBLIC_AUTH_REDIRECT_TO
ENV NEXT_PUBLIC_AUTH_REDIRECT_TO=${NEXT_PUBLIC_AUTH_REDIRECT_TO}
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ARG LOGIN_PIN_NUMBER
ENV LOGIN_PIN_NUMBER=${LOGIN_PIN_NUMBER}
ARG NEXT_PUBLIC_VALID_EMAIL_CONFIRMED_AT
ENV NEXT_PUBLIC_VALID_EMAIL_CONFIRMED_AT=${NEXT_PUBLIC_VALID_EMAIL_CONFIRMED_AT}
ARG VALID_USER_CREATED_AT
ENV VALID_USER_CREATED_AT=${VALID_USER_CREATED_AT}
ARG ORACLE_OLLAMA_HOST
ENV ORACLE_OLLAMA_HOST=${ORACLE_OLLAMA_HOST}
ARG LLM_SECRET_KEY
ENV LLM_SECRET_KEY=${LLM_SECRET_KEY}
ARG GOOGLE_SEARCH_API_KEY
ENV GOOGLE_SEARCH_API_KEY=${GOOGLE_SEARCH_API_KEY}
ARG GOOGLE_SEARCH_CX
ENV GOOGLE_SEARCH_CX=${GOOGLE_SEARCH_CX}
ARG GOOGLE_AI_API_KEY
ENV GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}

RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else npm run build; \
  fi


# 2단계: 프로덕션 이미지 실행
FROM base AS runner

WORKDIR /app

# 추출 전까지는 root 유지 - 추출 후에 사용자를 next js 로
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 모드에서 실행하고 public과 static 파일을 이미지로 복사.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 캐시 디렉터리만 생성 (모델은 런타임에서 local_files_only로 로드)
RUN mkdir -p /opt/hf-cache && chown -R nextjs:nodejs /opt/hf-cache

# 런타임에도 동일 키 주입
ARG NEXT_PUBLIC_ENV_VARIABLE
ENV NEXT_PUBLIC_ENV_VARIABLE=${NEXT_PUBLIC_ENV_VARIABLE}
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ARG SUPABASE_SERVICE_ROLE_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ARG NEXT_PUBLIC_AUTH_REDIRECT_TO
ENV NEXT_PUBLIC_AUTH_REDIRECT_TO=${NEXT_PUBLIC_AUTH_REDIRECT_TO}
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ARG LOGIN_PIN_NUMBER
ENV LOGIN_PIN_NUMBER=${LOGIN_PIN_NUMBER}
ARG NEXT_PUBLIC_VALID_EMAIL_CONFIRMED_AT
ENV NEXT_PUBLIC_VALID_EMAIL_CONFIRMED_AT=${NEXT_PUBLIC_VALID_EMAIL_CONFIRMED_AT}
ARG VALID_USER_CREATED_AT
ENV VALID_USER_CREATED_AT=${VALID_USER_CREATED_AT}
ARG ORACLE_OLLAMA_HOST
ENV ORACLE_OLLAMA_HOST=${ORACLE_OLLAMA_HOST}
ARG LLM_SECRET_KEY
ENV LLM_SECRET_KEY=${LLM_SECRET_KEY}
ARG GOOGLE_SEARCH_API_KEY
ENV GOOGLE_SEARCH_API_KEY=${GOOGLE_SEARCH_API_KEY}
ARG GOOGLE_SEARCH_CX
ENV GOOGLE_SEARCH_CX=${GOOGLE_SEARCH_CX}
ARG GOOGLE_AI_API_KEY
ENV GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}

# 런타임 캐시 경로 및 오프라인 모드 강제
ENV TRANSFORMERS_CACHE=/opt/hf-cache
ENV HF_ALLOW_REMOTE_MODELS=false

USER nextjs
CMD ["node", "server.js"]
