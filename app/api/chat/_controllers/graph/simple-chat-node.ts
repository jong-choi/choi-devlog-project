import { LangNodeName } from "@/types/chat";
import {
  llmModel,
  MAX_MESSAGES_LEN,
} from "@/app/api/chat/_controllers/utils/model";

import { Command } from "@langchain/langgraph";
import { SessionMessagesAnnotation } from "./graph";

export async function simpleChatNode(
  state: typeof SessionMessagesAnnotation.State
) {
  const aiMessage = await llmModel.invoke(
    state.messages.slice(0 - MAX_MESSAGES_LEN)
  );

  const nextState = {
    ...state,
    routeType: "" as const,
    messages: [aiMessage],
  };

  return new Command({
    goto: LangNodeName.routing,
    update: nextState,
  });
}
