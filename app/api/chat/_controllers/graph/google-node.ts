import { z } from "zod";
import { SystemMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { LangNodeName } from "@/types/chat";
import { SessionMessagesAnnotation } from "./graph";

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX!;
const MEX_RESULTS_LEN = 6;
const ItemSchema = z.object({
  title: z.string(),
  snippet: z.string(),
});

const ItemArraySchema = z.array(ItemSchema);

type Item = z.infer<typeof ItemSchema>;
type State = typeof SessionMessagesAnnotation.State;
type NextState = Partial<State>;

export async function googleNode(state: State) {
  console.log("Google node started"); //디버깅
  const lastUserMessage = state.messages
    .filter((msg) => msg.getType() === "human")
    .pop();

  const query = lastUserMessage?.content;
  let nextState: NextState = {};

  if (typeof query !== "string") {
    console.log("Invalid query type, ending google search"); //디버깅
    return {
      routeType: "" as const,
    };
  }
  
  console.log("Google search query:", query); //디버깅

  const params = new URLSearchParams({
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CX,
    q: query,
    num: String(MEX_RESULTS_LEN),
    fields: "items(title,snippet),searchInformation(totalResults)",
  });
  const url = `https://www.googleapis.com/customsearch/v1?${params}`;

  console.log("Calling Google API"); //디버깅
  const res: Response = await fetch(url);

  if (!res.ok) {
    console.error("Google API response not ok:", res.status, res.statusText); //디버깅
    nextState = {
      messages: [new SystemMessage("일시적인 오류로 검색에 실패하였습니다.")],
      routeType: "chat",
    };
    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  }

  const data = await res.json();

  let items: Array<Item>;
  try {
    items = ItemArraySchema.parse(data.items);
    console.log("Google search results:", items.length, "items"); //디버깅
  } catch (error) {
    console.error("Failed to parse Google search results:", error); //디버깅
    items = [];
  }

  nextState = {
    messages: [new SystemMessage(JSON.stringify(items))],
    routeType: "chat",
  };

  return new Command({
    goto: LangNodeName.routing,
    update: nextState,
  });
}
