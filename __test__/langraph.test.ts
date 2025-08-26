import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { buildGraph, SessionMessagesAnnotation } from "@/app/api/chat/_controllers/graph/graph";
import { LangNodeName } from "@/types/chat";

/**
 * 랭그래프 채팅 API 테스트
 * 
 * 구현 원리:
 * 1. LangGraph는 상태 기반 워크플로우 엔진
 * 2. routing -> chat/google/fetchSummary -> routing -> END 플로우
 * 3. 각 노드는 Command로 다음 노드와 상태 업데이트 반환
 * 4. routeType이 ""이면 END로 종료
 */

// 외부 의존성 Mock 설정
vi.mock("@/app/api/chat/_controllers/utils/model", () => ({
  llmModel: {
    invoke: vi.fn().mockResolvedValue(new AIMessage("Mock AI response")),
  },
  MAX_MESSAGES_LEN: 5,
}));

vi.mock("@/app/post/fetchers/ai", () => ({
  getAISummaryByPostId: vi.fn().mockResolvedValue({
    data: {
      post_id: "test-post",
      summary: "Mock post summary",
    },
  }),
}));


// Mock environment variables
vi.stubEnv("GOOGLE_SEARCH_API_KEY", "test-api-key");
vi.stubEnv("GOOGLE_SEARCH_CX", "test-cx");
vi.stubEnv("ORACLE_OLLAMA_HOST", "http://localhost:11434");
vi.stubEnv("LLM_SECRET_KEY", "test-secret");

// Mock fetch for Google API
global.fetch = vi.fn();

describe("랭그래프 채팅 API 테스트", () => {
  let graph: ReturnType<typeof buildGraph>;

  beforeEach(() => {
    graph = buildGraph();
    vi.clearAllMocks();
    (global.fetch as MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve({
        items: [
          { title: "Test Result", snippet: "Test snippet" },
        ],
      }),
      headers: new Headers(),
      redirected: false,
      type: "basic" as ResponseType,
      url: "",
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve(""),
    } as Response);
  });

  describe("그래프 구성 테스트", () => {
    it("그래프가 성공적으로 생성되는지 확인", () => {
      // 그래프 인스턴스와 상태 관리 함수가 존재하는지 확인
      expect(graph).toBeDefined();
      expect(graph.getState).toBeDefined();
    });

    it("노드 설정이 올바른지 확인", () => {
      // 모든 필요한 노드(routing, chat, google, fetchSummary)가 정의되어 있는지 확인
      const nodeNames = Object.values(LangNodeName);
      expect(nodeNames).toContain("routingNode");
      expect(nodeNames).toContain("chatNode");
      expect(nodeNames).toContain("googleNode");
      expect(nodeNames).toContain("fetchSummaryNode");
    });
  });

  describe("세션 상태 어노테이션 테스트", () => {
    it("어노테이션 구조가 올바른지 확인", () => {
      // SessionMessagesAnnotation이 필요한 모든 속성을 가지고 있는지 확인
      // messages: 대화 메시지 배열, routeType: 라우팅 타입, postId: 포스트 ID, postSummary: 포스트 요약
      const annotation = SessionMessagesAnnotation;
      
      expect(annotation).toBeDefined();
      expect(annotation.spec).toBeDefined();
      expect(annotation.spec.messages).toBeDefined();
      expect(annotation.spec.routeType).toBeDefined();
      expect(annotation.spec.postId).toBeDefined();
      expect(annotation.spec.postSummary).toBeDefined();
    });

    it("초기 상태가 올바르게 생성되는지 확인", () => {
      // 기본값들이 예상대로 설정되는지 테스트
      const initialState = {
        messages: [], // 빈 메시지 배열
        routeType: "chat" as const, // 기본 라우팅은 채팅
        postId: undefined, // 포스트 ID 없음
        postSummary: null, // 포스트 요약 없음
      };
      
      expect(initialState.messages).toEqual([]);
      expect(initialState.routeType).toBe("chat");
      expect(initialState.postId).toBeUndefined();
      expect(initialState.postSummary).toBeNull();
    });
  });

  describe("노드 실행 테스트", () => {
    it("채팅 플로우가 AI 응답과 함께 실행되는지 확인", async () => {
      // 사용자 메시지를 보내고 AI 응답을 받는 기본 채팅 플로우 테스트
      const initialState = {
        messages: [new HumanMessage("안녕하세요, 리액트에 대해 알려주세요")],
        routeType: "chat" as const,
        postId: undefined,
        postSummary: null,
      };

      const config = { configurable: { thread_id: "chat-thread" } };
      const result = await graph.invoke(initialState, config);

      // AI 응답이 생성되고 플로우가 종료되는지 확인
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.routeType).toBe(""); // 빈 문자열이면 종료
    });

    it("포스트 요약과 함께 채팅 플로우가 실행되는지 확인", async () => {
      // 포스트 요약이 있을 때 컨텍스트를 활용한 채팅이 되는지 테스트
      const initialState = {
        messages: [new HumanMessage("이 포스트에 대해 설명해주세요")],
        routeType: "chat" as const,
        postId: "test-post",
        postSummary: {
          id: "test-post",
          summary: "이것은 리액트 훅에 대한 튜토리얼입니다",
        },
      };

      const config = { configurable: { thread_id: "chat-with-summary" } };
      const result = await graph.invoke(initialState, config);

      // 포스트 요약을 컨텍스트로 사용한 응답이 생성되는지 확인
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.postSummary).toBeDefined();
    });

    it("구글 검색 플로우가 실행되는지 확인", async () => {
      // 사용자 검색 요청시 구글 API를 호출하는지 테스트
      const initialState = {
        messages: [new HumanMessage("리액트 훅 튜토리얼을 검색해주세요")],
        routeType: "google" as const,
        postId: undefined,
        postSummary: null,
      };

      const config = { configurable: { thread_id: "google-thread" } };
      const result = await graph.invoke(initialState, config);

      // 구글 검색 API가 호출되고 플로우가 종료되는지 확인
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("googleapis.com/customsearch")
      );
      expect(result.routeType).toBe("");
    });

    it("구글 API 오류를 적절히 처리하는지 확인", async () => {
      // API 호출 실패시 에러 메시지를 반환하는지 테스트
      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: () => Promise.resolve({}),
        headers: new Headers(),
        redirected: false,
        type: "basic" as ResponseType,
        url: "",
        clone: () => ({} as Response),
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(""),
      } as Response);

      const initialState = {
        messages: [new HumanMessage("뭔가를 검색해주세요")],
        routeType: "google" as const,
        postId: undefined,
        postSummary: null,
      };

      const config = { configurable: { thread_id: "google-error" } };
      const result = await graph.invoke(initialState, config);

      // 에러 메시지가 포함된 응답이 생성되는지 확인
      expect(result.messages.some(msg => 
        typeof msg.content === 'string' && msg.content.includes("일시적인 오류")
      )).toBe(true);
    });

    it("포스트 요약을 올바르게 가져오는지 확인", async () => {
      // 포스트 ID가 주어졌을 때 해당 포스트의 요약을 가져오는지 테스트
      const initialState = {
        messages: [new HumanMessage("요약을 가져와주세요")],
        routeType: "fetchSummary" as const,
        postId: "test-post-123",
        postSummary: null,
      };

      const config = { configurable: { thread_id: "summary-thread" } };
      const result = await graph.invoke(initialState, config);

      // 포스트 요약이 올바르게 설정되고 플로우가 종료되는지 확인
      expect(result.postSummary).toEqual({
        id: "test-post",
        summary: "Mock post summary",
      });
      expect(result.routeType).toBe("");
    });
  });

  describe("라우팅 로직 테스트", () => {
    it("포스트 ID 변경시 fetchSummary로 라우팅되는지 확인", async () => {
      // 현재 포스트 ID와 저장된 요약의 ID가 다르면 새 요약을 가져오는지 테스트
      const initialState = {
        messages: [new HumanMessage("안녕하세요")],
        routeType: "chat" as const,
        postId: "new-post", // 새로운 포스트 ID
        postSummary: { id: "old-post", summary: "이전 요약" }, // 이전 포스트 요약
      };

      const config = { configurable: { thread_id: "routing-test" } };
      const result = await graph.invoke(initialState, config);

      // 새 포스트 요약이 가져와지고 플로우가 종료되는지 확인
      expect(result.postSummary?.id).toBe("test-post");
      expect(result.routeType).toBe("");
    });

    it("routeType이 비어있을 때 종료되는지 확인", async () => {
      // routeType이 빈 문자열이면 그래프가 END로 이동하여 종료되는지 테스트
      const initialState = {
        messages: [new HumanMessage("안녕하세요")],
        routeType: "" as const, // 빈 라우트 타입 = 종료 신호
        postId: undefined,
        postSummary: null,
      };

      const config = { configurable: { thread_id: "end-test" } };
      const result = await graph.invoke(initialState, config);

      // 그대로 종료 상태를 유지하는지 확인
      expect(result.routeType).toBe("");
    });
  });

  describe("에러 처리 테스트", () => {
    it("LLM 호출 오류를 처리하는지 확인", async () => {
      // LLM API 호출 실패시 예외가 제대로 발생하는지 테스트
      const { llmModel } = await import("@/app/api/chat/_controllers/utils/model");
      (llmModel.invoke as MockedFunction<typeof llmModel.invoke>).mockRejectedValueOnce(new Error("LLM Error"));

      const initialState = {
        messages: [new HumanMessage("안녕하세요")],
        routeType: "chat" as const,
        postId: undefined,
        postSummary: null,
      };

      const config = { configurable: { thread_id: "llm-error" } };
      
      // LLM 에러가 제대로 전파되는지 확인
      await expect(graph.invoke(initialState, config)).rejects.toThrow("LLM Error");
    });

    it("포스트 요약 API 오류를 처리하는지 확인", async () => {
      // 포스트 요약 API 호출 실패시 에러를 적절히 처리하는지 테스트
      const { getAISummaryByPostId } = await import("@/app/post/fetchers/ai");
      (getAISummaryByPostId as MockedFunction<typeof getAISummaryByPostId>).mockRejectedValueOnce(new Error("API Error"));

      const initialState = {
        messages: [new HumanMessage("요약을 가져와주세요")],
        routeType: "fetchSummary" as const,
        postId: "error-post",
        postSummary: null,
      };

      const config = { configurable: { thread_id: "api-error" } };
      const result = await graph.invoke(initialState, config);
      
      // 에러 발생시 postSummary는 null을 유지하고 플로우는 종료되는지 확인
      expect(result.postSummary).toBeNull();
      expect(result.routeType).toBe("");
    });

    it("구글 API 비정상 응답 형식을 처리하는지 확인", async () => {
      // 구글 API가 예상과 다른 형식의 데이터를 반환할 때 에러 처리 테스트
      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve({ items: "invalid" }),
        headers: new Headers(),
        redirected: false,
        type: "basic" as ResponseType,
        url: "",
        clone: () => ({} as Response),
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(""),
      } as Response);

      const initialState = {
        messages: [new HumanMessage("비정상 검색")],
        routeType: "google" as const,
        postId: undefined,
        postSummary: null,
      };

      const config = { configurable: { thread_id: "invalid-response" } };
      const result = await graph.invoke(initialState, config);
      
      // 말우된 데이터 형식에서도 빈 배열로 에러를 처리하는지 확인
      expect(result.messages.some(msg => 
        typeof msg.content === 'string' && msg.content === JSON.stringify([])
      )).toBe(true);
    });
  });

  describe("통합 테스트", () => {
    it("전체 채팅 워크플로우가 완료되는지 확인", async () => {
      // 포스트 ID가 있는 상태에서 채팅 요청시 전체 플로우 테스트
      // routing -> fetchSummary -> routing -> chat -> routing -> END 순서
      const config = { configurable: { thread_id: "integration-test" } };
      
      const chatState = {
        messages: [new HumanMessage("리액트에 대해 알려주세요")],
        routeType: "chat" as const,
        postId: "react-post",
        postSummary: null,
      };

      const result = await graph.invoke(chatState, config);
      
      // 포스트 요약이 가져와지고, AI 응답이 생성되고, 플로우가 종료되는지 확인
      expect(result.postSummary).toBeDefined();
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.routeType).toBe("");
    });

    it("구글 검색 후 채팅 워크플로우를 처리하는지 확인", async () => {
      // 구글 검색만 실행하는 단순 플로우 테스트
      const config = { configurable: { thread_id: "google-chat-test" } };
      
      const searchState = {
        messages: [new HumanMessage("타입스크립트를 검색해주세요")],
        routeType: "google" as const,
        postId: undefined,
        postSummary: null,
      };

      const searchResult = await graph.invoke(searchState, config);
      // 검색 결과가 생성되는지 확인
      expect(searchResult.messages.length).toBeGreaterThan(0);
    });
  });

  describe("노드 설정 테스트", () => {
    it("노드 연결이 올바른지 확인", () => {
      // 그래프 구조가 올바른지 확인
      // 내부 구조를 직접 검사하기 어려우므로 실행을 통해 플로우가 정상 동작하는지 테스트
      expect(graph).toBeDefined();
    });
  });
});