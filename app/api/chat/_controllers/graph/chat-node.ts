import { LangNodeName } from "@/types/chat";
import { llmModel } from "@/app/api/chat/_controllers/utils/model";

import { Command, MessagesAnnotation } from "@langchain/langgraph";

export async function chatNode(state: typeof MessagesAnnotation.State) {
  const aiMessage = await llmModel.invoke(state.messages.slice(-5));

  const nextState = {
    ...state,
    routeType: "" as const,
    messages: [aiMessage],
  };

  return new Command({
    goto: LangNodeName.decision,
    update: nextState,
  });
}
