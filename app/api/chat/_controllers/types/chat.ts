import { BaseMessage } from "@langchain/core/messages";

export interface GraphState {
  messages: BaseMessage[];
}

export const LangNodeName = {
  decision: "decisionNode",
  chat: "chatNode",
  google: "googleNode",
  blog: "blogSearchNode",
} as const;

export type LangNodeKeys =
  | keyof typeof LangNodeName
  | ""
  | "summary"
  | "recomment";
