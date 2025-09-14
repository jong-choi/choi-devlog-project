# Hugging Face 모델 Docker 최적화: 런타임 다운로드에서 빌드타임 캐싱으로

## 관련 자료

### 공식 문서

- **[Hugging Face Transformers.js 공식 문서](https://huggingface.co/docs/transformers.js)**
  - Transformers.js의 설치, 사용법, API 레퍼런스 제공
  - 브라우저와 Node.js 환경에서의 모델 사용 가이드
  - 환경변수 설정(`env.cacheDir`, `env.allowRemoteModels` 등) 상세 설명

- **[Model Hub - Cache management](https://huggingface.co/docs/datasets/en/cache)**
  - Hugging Face Hub 모델 캐싱 메커니즘 설명
  - `HF_HOME`, `TRANSFORMERS_CACHE` 등 환경변수 사용법
  - 오프라인 모드 설정 및 캐시 관리 방법

- **[Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)**
  - 효율적인 Docker 이미지 빌드 가이드
  - 멀티스테이지 빌드와 레이어 캐싱 최적화 전략
  - 프로덕션 환경에서의 컨테이너 보안 및 성능 고려사항

### 커뮤니티 자료

- **[Stack Overflow: Hugging Face cache directory](https://stackoverflow.com/questions/63312859/how-to-change-huggingface-transformers-default-cache-directory)**
  - 캐시 디렉터리 변경 방법과 환경변수 설정 질답
  - `TRANSFORMERS_CACHE` vs `HF_HOME` 차이점 설명
  - 다양한 운영체제에서의 캐시 경로 설정 예시

- **[GitHub Issue: Model caching in Docker](https://github.com/huggingface/transformers.js/issues/889)**
  - Transformers.js 라이브러리의 Docker 환경에서 모델 캐싱 이슈
  - 개발자들의 실제 경험과 해결책 공유
  - `local_files_only` 옵션 사용법과 주의사항

- **[Hugging Face Forum: Manual model downloading](https://discuss.huggingface.co/t/manually-downloading-models-in-docker-build-with-snapshot-download/19637)**
  - `snapshot_download` 함수를 이용한 수동 모델 다운로드 방법
  - Docker 빌드 시점에서 모델 사전 다운로드 전략
  - 대용량 모델 처리 시 메모리 및 디스크 관리 팁

### 기술 블로그

- **[How to Deploy Hugging Face Models in Docker](https://fgiasson.com/blog/index.php/2023/08/23/how-to-deploy-hugging-face-models-in-a-docker-container/)**
  - 실제 프로덕션 환경에서의 Hugging Face 모델 배포 경험담
  - 모델 크기 최적화와 메모리 사용량 관리 전략
  - Docker 컨테이너에서의 GPU 활용 및 성능 튜닝 방법

- **[Docker Blog: LLM Everywhere](https://www.docker.com/blog/llm-docker-for-local-and-hugging-face-hosting/)**
  - Docker를 활용한 LLM(대규모 언어모델) 배포 가이드
  - 로컬 개발 환경과 클라우드 호스팅 전략 비교
  - 컨테이너화된 AI 서비스의 스케일링과 오케스트레이션

- **[Model Caching Optimization Guide](https://markaicode.com/transformers-model-caching-optimization/)**
  - Transformers 라이브러리 캐싱 성능 최적화 심화 가이드
  - 캐시 히트율 향상 기법과 디스크 I/O 최적화
  - 멀티 모델 환경에서의 메모리 효율적 캐시 관리

## 환경설정 1차

- 기본 모델
  - 임베딩: `onnx-community/embeddinggemma-300m-ONNX`
  - 리랭커: `jinaai/jina-reranker-v2-base-multilingual`

- 공통 환경설정: `lib/hf/env.ts`
  - 캐시 경로 우선순위: `TRANSFORMERS_CACHE` > `HF_HOME/transformers` > `<프로젝트>/.cache/transformers`
  - `env.useBrowserCache=false`, `env.allowLocalModels=true`
  - 오프라인 제어: `HF_ALLOW_REMOTE_MODELS=false` 설정 시 네트워크 접근 차단

- 애플리케이션 코드 적용
  - `app/api/embedding/_model/embeddings.ts`, `app/api/embedding/_model/reranker.ts`가 공통 설정을 자동 로드하도록 수정

- 사전 다운로드 스크립트: `scripts/preload-hf-models.mjs`
  - 임베딩/리랭커 모델 워밍업으로 캐시 생성
  - 환경변수: `HF_EMBEDDING_MODEL_ID`, `HF_RERANKER_MODEL_ID`, `HF_PRELOAD_TARGETS`(기본: `embedding,reranker`)
  - 캐시 경로: `env.cacheDir`(상단 우선순위 규칙 적용)

- npm 스크립트
  - `npm run hf:cache` — 모델 캐시 프리로드
  - `npm run hf:offline` — 오프라인 실행(`HF_ALLOW_REMOTE_MODELS=false` + `next start`)

- Docker/Compose
  - Dockerfile 빌드 단계에서 `/opt/hf-cache`로 모델 프리로드, 런타임은 `HF_ALLOW_REMOTE_MODELS=false`로 오프라인 고정
  - Compose 볼륨 `hf-cache:/opt/hf-cache`로 캐시 지속화
  - 선택적 빌드 인자: `HF_EMBEDDING_MODEL_ID`, `HF_RERANKER_MODEL_ID`

### 실행 요약

로컬:

```bash
npm run hf:cache
HF_ALLOW_REMOTE_MODELS=false npm run start
# (선택) 캐시 경로 고정
TRANSFORMERS_CACHE=$HOME/.cache/transformers npm run hf:cache
```

Docker:

```bash
docker compose -f compose.prod.yaml build
docker compose -f compose.prod.yaml up -d
# (선택) 특정 모델로 빌드
docker build -f prod.Dockerfile \
  --build-arg HF_EMBEDDING_MODEL_ID=onnx-community/embeddinggemma-300m-ONNX \
  --build-arg HF_RERANKER_MODEL_ID=jinaai/jina-reranker-v2-base-multilingual \
  -t blog-app .
```

## Hugging Face 모델 캐시/오프라인 실행

- 공통 설정: `lib/hf/env.ts` 가 `TRANSFORMERS_CACHE`(또는 `HF_HOME/transformers`)를 캐시로 사용하고, `HF_ALLOW_REMOTE_MODELS`로 원격 허용 여부를 제어합니다.
- 로컬 최초 캐시 프리로드:

```bash
npm run hf:cache
```

- 오프라인으로 앱 실행(캐시만 사용):

```bash
HF_ALLOW_REMOTE_MODELS=false npm run start
```

### Docker

- 빌드 시 모델 사전 다운로드가 수행되어 이미지에 캐시가 포함됩니다.
- 런타임에는 `/opt/hf-cache` 가 기본 캐시 경로로 설정되며 원격 다운로드가 비활성화됩니다.
- Compose에서 볼륨 `hf-cache` 로 캐시를 지속화합니다.

선택적 빌드 인자:

```yaml
build:
  args:
    HF_EMBEDDING_MODEL_ID: onnx-community/embeddinggemma-300m-ONNX
    HF_RERANKER_MODEL_ID: jinaai/jina-reranker-v2-base-multilingual
```

## 환경설정 2차

- 환경설정 통합: `lib/hf/env.ts` 추가
  - 캐시 경로 우선순위: `TRANSFORMERS_CACHE` > `HF_HOME/transformers` > `<프로젝트>/.cache/transformers`
  - `env.allowRemoteModels`를 `HF_ALLOW_REMOTE_MODELS`로 제어 (기본 true)
  - `env.useBrowserCache=false`, `env.allowLocalModels=true`

- 모델 코드 업데이트
  - `app/api/embedding/_model/embeddings.ts` → `pipeline(..., { dtype:"fp32", local_files_only:true })`
  - `app/api/embedding/_model/reranker.ts` → `AutoTokenizer.from_pretrained(..., { local_files_only:true })`, `XLMRobertaModel.from_pretrained(..., { dtype:"fp32", local_files_only:true })`

- 사전 다운로드 스크립트: `scripts/preload-hf-models.mjs`
  - 캐시 디렉토리 자동 결정 및 원격 허용 강제(프리로드 시)
  - 대상 선택: `HF_PRELOAD_TARGETS=embedding,reranker`

- Docker 최종 결정
  - 베이스: `node:20-bookworm-slim` + `libgomp1`/`ca-certificates`
  - 빌드 스테이지에서만 `RUN node scripts/preload-hf-models.mjs`
  - 런타임: `/opt/hf-cache` 디렉토리만 생성, 모델 로딩은 `local_files_only:true`
  - Compose: `hf-cache:/opt/hf-cache` 볼륨으로 캐시 지속화

- npm 스크립트
  - `hf:cache` — 사전 다운로드 실행
  - `hf:offline` — `HF_ALLOW_REMOTE_MODELS=false`로 오프라인 실행

주의사항

- Alpine(glibc 부재)에서는 `onnxruntime-node` 네이티브 바인딩 로딩 실패 가능 → Debian slim 사용
- 로컬/CI 디스크 여유 공간 부족 시 도커 빌드 캐시/이미지 정리 필요
