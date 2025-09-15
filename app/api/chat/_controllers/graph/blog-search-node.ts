import { SystemMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { LangNodeName } from "@/types/chat";
import { CardPost } from "@/types/post";
import { SemanticSearchResult } from "@/types/semantic-search";
import { SessionMessagesAnnotation } from "./graph";

type State = typeof SessionMessagesAnnotation.State;
type NextState = Partial<State>;

export async function blogSearchNode(state: State) {
  if (state.routingQuery === null) {
    return {
      routeType: "chat" as const,
    };
  }

  let nextState: NextState = {
    routingQuery: null,
  };
  const allPosts: CardPost[] = [];

  // 단일 검색어 또는 다중 검색어 처리
  const queries = Array.isArray(state.routingQuery)
    ? state.routingQuery
    : [state.routingQuery];

  for (const query of queries) {
    try {
      const res: Response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/semantic-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query,
            overSampleCount: 10,
            maxResults: 10,
            minResults: 0,
          }),
        },
      );

      if (!res.ok) {
        console.error(
          "Semantic search API response not ok:",
          res.status,
          res.statusText,
        );
        continue;
      }

      const data = await res.json();
      const results: SemanticSearchResult[] = data.results || [];

      // SemanticSearchResult를 CardPost로 변환
      const posts: CardPost[] = results.map((result) => ({
        id: result.post_id,
        title: result.title,
        short_description: result.short_description,
        thumbnail: result.thumbnail,
        released_at: result.released_at,
        url_slug: result.url_slug,
        snippet: result.chunk_content,
        tags: null,
      }));

      allPosts.push(...posts);
    } catch (error) {
      console.error("Semantic search error for query:", query, error);
      continue;
    }
  }

  const uniquePosts = allPosts.filter(
    (post, index, array) => array.findIndex((p) => p.id === post.id) === index,
  );

  if (uniquePosts.length === 0) {
    const queryText = Array.isArray(state.routingQuery)
      ? state.routingQuery.join(", ")
      : state.routingQuery;

    nextState = {
      ...nextState,
      messages: [
        new SystemMessage(
          `"${queryText}"에 대한 블로그 검색 결과를 찾을 수 없습니다.`,
        ),
      ],
      routeType: "chat",
    };
    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  }

  const queryText = Array.isArray(state.routingQuery)
    ? state.routingQuery.join(", ")
    : state.routingQuery;

  // 검색 결과를 정리하여 시스템 메시지로 전달
  const searchResultsMessage = `블로그에서 "${queryText}" 검색 결과를 찾았습니다:
  ${uniquePosts
    .map(
      (post, index) =>
        `${index + 1}. **${post.title}**
- 요약: ${post.short_description}
- 링크: ${process.env.NEXT_PUBLIC_BASE_URL}/post/${post.url_slug}
- 발행일: ${new Date(post.released_at || "").toLocaleDateString("ko-KR")}
- 관련 내용: ${post.snippet}
- 태그: ${post.tags?.map((tag) => `#${tag}`).join(" ")}`,
    )
    .join("\n")}

## 응답 가이드라인
위 검색 결과를 바탕으로 사용자의 질문에 답변할 때:
1. 가장 관련성이 높은 게시글들을 4개~6개 정도 선정하여 언급하세요.
2. 제목에 링크를 달아 소개하고, 간략한 정보를 함께 소개하세요.
3. 마무리는 간단하게.

## 예시 검색결과 형태
- **[React Hook 완전 정복하기](http...)** - useState, useEffect 등의 기본 훅부터 커스텀 훅 작성법까지 자세히 다루고 있습니다.

-**[Next.js와 React 최적화 팁](http...)** - 성능 최적화와 관련된 실무 경험을 공유하고 있습니다.`;

  nextState = {
    ...nextState,
    messages: [new SystemMessage(searchResultsMessage)],
    routeType: "chat",
  };

  return new Command({
    goto: LangNodeName.routing,
    update: nextState,
  });
}
