import { z } from "zod";
import { SystemMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { LangNodeName } from "@/types/chat";
import { SessionMessagesAnnotation } from "./graph";

const METASEARCH_URL = "https://metasearch.jongchoi.com/search";
const MAX_RESULTS_LEN = 10;
const MetaSearchResultSchema = z.object({
  title: z.string(),
  content: z.string().optional().nullable(),
});

const MetaSearchResponseSchema = z.object({
  results: z.array(MetaSearchResultSchema),
});

type MetaSearchResult = z.infer<typeof MetaSearchResultSchema>;
type Item = {
  title: string;
  snippet?: string;
};
type State = typeof SessionMessagesAnnotation.State;
type NextState = Partial<State>;

const getMetaSearchApiKey = () => process.env.METASEARCH_API_KEY;

export async function googleNode(state: State) {
  if (state.routingQuery === null) {
    return {
      routeType: "chat" as const,
    };
  }
  const apiKey = getMetaSearchApiKey();

  let nextState: NextState = {
    routingQuery: null,
  };
  const allItems: Array<Item> = [];

  // 단일 검색어 또는 다중 검색어 처리
  const queries = Array.isArray(state.routingQuery)
    ? state.routingQuery
    : [state.routingQuery];

  // 각 검색어로 검색 수행
  for (const query of queries) {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      categories: "general",
      language: "ko-KR",
      pageno: "1",
    });
    const url = `${METASEARCH_URL}?${params}`;

    try {
      const res: Response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "X-API-Key": apiKey ?? "",
        },
      });

      if (!res.ok) {
        console.error(
          "Meta search response not ok:",
          res.status,
          res.statusText,
        );
        continue;
      }

      const data = await res.json();

      try {
        const parsed = MetaSearchResponseSchema.parse(data);
        const items: Array<Item> = parsed.results.map(
          (result: MetaSearchResult) => ({
            title: result.title,
            snippet: result.content ?? undefined,
          }),
        );
        allItems.push(...items);
      } catch (error) {
        console.error("Failed to parse meta search results:", error);
        continue;
      }
    } catch (error) {
      console.error("Meta search error for query:", query, error);
      continue;
    }
  }

  if (allItems.length === 0) {
    nextState = {
      ...nextState,
      messages: [new SystemMessage("일시적인 오류로 검색에 실패하였습니다.")],
      routeType: "chat",
    };
    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  }

  nextState = {
    ...nextState,
    messages: [new SystemMessage(JSON.stringify(allItems.slice(0, MAX_RESULTS_LEN)))],
    routeType: "chat",
  };

  return new Command({
    goto: LangNodeName.routing,
    update: nextState,
  });
}
