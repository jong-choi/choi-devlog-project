import { SystemMessage } from "@langchain/core/messages";
import { Command, MessagesAnnotation } from "@langchain/langgraph";
import { LangNodeName } from "../types/chat";

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX!;
type item = {
  title: string;
  snippet: string;
};

export async function googleNode(state: typeof MessagesAnnotation.State) {
  const lastUserMessage = state.messages
    .filter((msg) => msg.getType() === "human")
    .pop();

  const query = lastUserMessage?.content;

  if (typeof query !== "string") {
    return {
      routeType: "" as const,
    };
  }

  const params = new URLSearchParams({
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CX,
    q: query,
    num: "10",
    fields: "items(title,snippet),searchInformation(totalResults)",
  });
  const url = `https://www.googleapis.com/customsearch/v1?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    return {
      routeType: "" as const,
    };
  }

  const data = await res.json();

  const items = data.items as Array<item>;

  const nextState = {
    messages: [new SystemMessage(JSON.stringify(items))],
    routeType: "chat" as const,
  };

  return new Command({
    goto: LangNodeName.decision,
    update: nextState,
  });
}
