import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { RequestType, RequestContext } from "./types";

export const MultiAgentState = Annotation.Root({
  messages: MessagesAnnotation.spec.messages,
  type: Annotation<RequestType>({
    value: (_prev, next) => next,
    default: () => "chat",
  }),
  context: Annotation<RequestContext | Record<string, unknown>>({
    value: (_prev, next) => next,
    default: () => ({}),
  }),
  userMessage: Annotation<string>({
    value: (_prev, next) => next,
    default: () => "",
  }),
  finalResponse: Annotation<string>({
    value: (_prev, next) => next,
    default: () => "",
  }),
  post_id: Annotation<string | undefined>({
    value: (_prev, next) => next,
    default: () => undefined,
  }),
  sessionId: Annotation<string>({
    value: (_prev, next) => next,
    default: () => "",
  }),
});
