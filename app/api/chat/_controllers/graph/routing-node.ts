import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Command, END } from "@langchain/langgraph";
import { SessionMessagesAnnotation } from "@/app/api/chat/_controllers/graph/graph";
import { routingModel } from "@/app/api/chat/_controllers/utils/model";
import { LangNodeName, RouteType, routeKeys } from "@/types/chat";

export async function routingNode(
  state: typeof SessionMessagesAnnotation.State,
) {
  let next = state.routeType;
  let routingQuery: string | string[] | null = null;

  // 라우트 타입 없이 진입
  if (!next) {
    const lastUserMessage = state.messages
      .filter((message) => message.getType() === "human")
      .at(-1);

    if (!lastUserMessage) {
      return new Command({
        goto: END,
      });
    }

    const decisionRes = await routingModel.invoke([
      new SystemMessage(
        `당신은 기술블로그 챗봇의 라우팅을 결정하는 AI입니다. 사용자의 질문을 분석하여 다음 형태로 응답해야 합니다.

응답 형태:
- Google 검색이 필요한 경우: {"type": "google", "query": ["검색어1", "검색어2", "검색어 3"]}
- 이 기술블로그 내 검색이 필요한 경우 {"type": "blogSearch", "query": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "한글 키워드5", "한글 키워드6"]} (예시 : ["supabase", "슈퍼베이스"], ["Next.js", "next js", "next", "넥스트"])
- 간단한 대화인 경우: {"type": "chat"}
- 사용자가 현재 보는 게시글 관련 질문이라 요약을 확인해야하는 경우: {"type": "summary"}

판단 기준:
- 'google': 최신 정보나 웹 검색이 필요한 일반적인 질문 (이 경우 검색에 최적화된 쿼리도 함께 생성. 다중 검색이 필요할 땐 최대 3개의 검색어.)
- 'summary': 현재 보고 있는 게시글에 대한 질문이나 블로그에 대한 질문
- 'blogSearch': '관련된 게시물', '연관된 게시물', '이 블로그에 있는 게시물'에 대한 검색이 필요한 질문 (text-full-search 검색이 정확하도록 영어/한글 및 다양한 키워드와 짧은 검색어로 최대 6개 검색어)
- 'chat': 간단한 인사, 대화, 또는 AI 자신에 대한 질문

반드시 유효한 형태로만 응답하세요.`,
      ),
      new HumanMessage(lastUserMessage.content as string),
    ]);
    if (typeof decisionRes.content === "string") {
      try {
        const decision = JSON.parse(decisionRes.content.trim());
        if (decision.type && routeKeys.includes(decision.type as RouteType)) {
          next = decision.type as RouteType;
          if (decision.query) {
            if (
              typeof decision.query === "string" ||
              Array.isArray(decision.query)
            ) {
              console.log(decision.query);
              routingQuery = decision.query;
            }
          }
        }
      } catch (error) {
        console.error(error);
        console.log(decisionRes.content);
        next = "chat";
      }
    } else {
      next = "chat";
    }
  }

  // end면 종료 - 없어도 __end__로 이동하면서 작동함
  if (next == "end") {
    return new Command({
      goto: END,
    });
  }

  if (next in LangNodeName) {
    return new Command({
      update: {
        routeType: next,
        routingQuery,
      },
      goto: LangNodeName[next as keyof typeof LangNodeName],
    });
  }

  return new Command({
    goto: END,
  });
}
