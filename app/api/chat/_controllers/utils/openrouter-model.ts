import { ChatOpenAI } from "@langchain/openai";

export const DEFAULT_OPENROUTER_SMALL_MODEL = "openai/gpt-oss-20b";
export const DEFAULT_OPENROUTER_MEDIUM_MODEL = "openai/gpt-oss-120b";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL;

export const isOpenRouterConfigured = (): boolean =>
  Boolean(
    OPENROUTER_API_KEY &&
      OPENROUTER_API_KEY.trim().length > 0 &&
      OPENROUTER_BASE_URL &&
      OPENROUTER_BASE_URL.trim().length > 0,
  );

export const createOpenRouterModel = ({
  model,
  streaming,
}: {
  model: string;
  streaming?: boolean;
}) => {
  if (!isOpenRouterConfigured()) {
    throw new Error(
      "OPENROUTER_API_KEY and OPENROUTER_BASE_URL must be configured",
    );
  }

  return new ChatOpenAI({
    model,
    apiKey: OPENROUTER_API_KEY,
    temperature: 0,
    ...(streaming === undefined ? {} : { streaming }),
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
    },
  });
};

export const createOpenRouterModelIfConfigured = ({
  model,
  streaming,
}: {
  model: string;
  streaming?: boolean;
}) =>
  isOpenRouterConfigured()
    ? createOpenRouterModel({
        model,
        streaming,
      })
    : null;
