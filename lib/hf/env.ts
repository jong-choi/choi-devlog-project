import fs from "node:fs";
import path from "node:path";
import { env } from "@huggingface/transformers";

// Hugging Face Transformers.js 환경 공통 설정
// - 캐시 디렉토리 고정 (로컬/도커 공통)
// - 원격 모델 허용 여부 제어 (오프라인 실행 지원)

const resolveCacheDir = (): string => {
  // 우선순위: TRANSFORMERS_CACHE > HF_HOME/transformers > <cwd>/.cache/transformers
  const explicit = process.env.TRANSFORMERS_CACHE;
  if (explicit && explicit.trim().length > 0) return explicit;

  const hfHome = process.env.HF_HOME;
  if (hfHome && hfHome.trim().length > 0) {
    return path.join(hfHome, "transformers");
  }

  return path.join(process.cwd(), ".cache", "transformers");
};

const cacheDir = resolveCacheDir();

try {
  fs.mkdirSync(cacheDir, { recursive: true });
} catch (_err) {
  // 생성 실패 시에도 실행은 계속 (읽기 전용일 수 있음)
}

// Node 환경에서 브라우저 캐시 비활성화
env.useBrowserCache = false;

// 로컬 경로 허용
env.allowLocalModels = true;

// 캐시 디렉토리 지정
env.cacheDir = cacheDir;

// 원격 모델 허용 여부 (기본: true)
// 런타임에서 오프라인 모드로 강제하려면 HF_ALLOW_REMOTE_MODELS=false 설정
env.allowRemoteModels =
  (process.env.HF_ALLOW_REMOTE_MODELS ?? "true").toLowerCase() !== "false";

export const HF_CACHE_DIR = cacheDir;
