import { createOllamaModel } from "@/app/api/chat/_controllers/utils/ollama-model";
import {
  createOpenRouterModelIfConfigured,
  DEFAULT_OPENROUTER_MEDIUM_MODEL,
  DEFAULT_OPENROUTER_SMALL_MODEL,
} from "@/app/api/chat/_controllers/utils/openrouter-model";

export const MAX_MESSAGES_LEN = 10;
const OLLAMA_SMALL_MODEL = process.env.OLLAMA_SMALL_MODEL;
const OLLAMA_MEDIUM_MODEL = process.env.OLLAMA_MEDIUM_MODEL;
const OPENROUTER_SMALL_MODEL =
  process.env.OPENROUTER_SMALL_MODEL || DEFAULT_OPENROUTER_SMALL_MODEL;
const OPENROUTER_MEDIUM_MODEL =
  process.env.OPENROUTER_MEDIUM_MODEL || DEFAULT_OPENROUTER_MEDIUM_MODEL;

if (!OLLAMA_SMALL_MODEL || !OLLAMA_MEDIUM_MODEL) {
  throw new Error(
    "OLLAMA_SMALL_MODEL and OLLAMA_MEDIUM_MODEL environment variables are required",
  );
}

const mediumPrimaryModel = createOllamaModel({
  model: OLLAMA_MEDIUM_MODEL,
  numPredict: 32768,
});

const smallPrimaryModel = createOllamaModel({
  model: OLLAMA_SMALL_MODEL,
  numPredict: 8192,
  streaming: false,
});

export const mediumFallbackModel = createOpenRouterModelIfConfigured({
  model: OPENROUTER_MEDIUM_MODEL,
});

export const smallFallbackModel = createOpenRouterModelIfConfigured({
  model: OPENROUTER_SMALL_MODEL,
  streaming: false,
});

export const mediumModel = mediumFallbackModel
  ? mediumPrimaryModel.withFallbacks({
      fallbacks: [mediumFallbackModel],
    })
  : mediumPrimaryModel;

export const smallModel = smallFallbackModel
  ? smallPrimaryModel.withFallbacks({
      fallbacks: [smallFallbackModel],
    })
  : smallPrimaryModel;
