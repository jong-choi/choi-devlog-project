import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { MessageContent } from "@langchain/core/messages";
import type { GraphState, AgentConfig, SSEWriter } from "../_types";
import {
  isObject,
  isToolStartEvent,
  isToolEndEvent,
  isChatStreamEvent,
  isChatEndEvent,
} from "../_types";
import { ChatMessageHistoryWithDeletion } from "../_utils/chatHistory";
import { sessionStore } from "./sessionStore";
import { createLLMModel, createSystemPrompt } from "./model";
import {
  MODEL_NAME,
  SYSTEM_PROMPT,
  SESSION_IDLE_TIMEOUT_MS,
} from "./constants";
import { safeSSEvent } from "../_utils/safeSSE";
import { getAvailableTools } from "../_utils/tools";

// LangGraph 메모리 체크포인터 및 에이전트를 모듈 스코프로 1회 생성해 세션별(thread_id) 히스토리를 유지
const checkpointer = new MemorySaver();

const extractText = (content: string | MessageContent[]): string => {
  if (typeof content === "string") return content;
  const parts: string[] = [];
  for (const block of content) {
    if (
      typeof block === "object" &&
      block !== null &&
      "text" in block &&
      typeof (block as { text: unknown }).text === "string"
    ) {
      parts.push((block as { text: string }).text);
    }
  }
  return parts.join("");
};

// ReAct 에이전트 생성 함수 (도구 목록을 동적으로 설정하기 위해)
const createAgent = (isDBAllowed: boolean = false) => createReactAgent({
  llm: createLLMModel(),
  tools: getAvailableTools(isDBAllowed),
  checkpointer,
  prompt: (state: GraphState, config: AgentConfig) => {
    const cfg = config?.configurable ?? {};
    const messages = state?.messages ?? [];
    const baseline = [
      new SystemMessage({ content: SYSTEM_PROMPT }),
      ...messages,
    ];

    let userText = "";
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.getType() === "human") {
        const c = m.content as string | MessageContent[];
        userText = extractText(c);
        break;
      }
    }

    let sysContent: string | undefined;
    if (cfg.systemContext || cfg.isDBAllowed) {
      sysContent = createSystemPrompt(
        userText,
        cfg.systemContext || "",
        !!cfg.isDBAllowed
      );
    }

    if (typeof sysContent === "string" && sysContent) {
      return [new SystemMessage({ content: sysContent }), ...baseline];
    }

    return baseline;
  },
});

// SSE Writer 구현
class NextSSEWriter implements SSEWriter {
  private encoder = new TextEncoder();
  private controller?: ReadableStreamDefaultController<Uint8Array>;
  private ended = false;

  constructor(controller: ReadableStreamDefaultController<Uint8Array>) {
    this.controller = controller;
  }

  write(chunk: string): void {
    if (!this.ended && this.controller) {
      this.controller.enqueue(this.encoder.encode(chunk));
    }
  }

  end(): void {
    if (!this.ended && this.controller) {
      this.controller.close();
      this.ended = true;
    }
  }

  isEnded(): boolean {
    return this.ended;
  }
}

// 챗봇 로직
export default class SSEChatbotController {
  createSession = () => {
    const id = randomUUID();
    sessionStore.set({ id, history: new ChatMessageHistoryWithDeletion() });
    sessionStore.setIdleTimer(id, SESSION_IDLE_TIMEOUT_MS, () => {
      const cur = sessionStore.get(id);
      cur?.abort?.abort();
      if (cur?.writer) {
        safeSSEvent(cur.writer, "expired", { reason: "idle_timeout" });
        cur.writer.end();
      }
      void checkpointer.deleteThread(id);
      sessionStore.delete(id);
    });
    return NextResponse.json({ sessionId: id });
  };

  openStream = (request: NextRequest) => {
    const sessionId = String(
      request.nextUrl.searchParams.get("sessionId") || ""
    );
    const s = sessionStore.get(sessionId);

    if (!s) {
      return new Response(null, { status: 404 });
    }

    const stream = new ReadableStream<Uint8Array>({
      start: (controller) => {
        const writer = new NextSSEWriter(controller);
        s.writer = writer;
        s.abort = new AbortController();

        sessionStore.setIdleTimer(sessionId, SESSION_IDLE_TIMEOUT_MS, () => {
          const cur = sessionStore.get(sessionId);
          cur?.abort?.abort();
          if (cur?.writer) {
            safeSSEvent(cur.writer, "expired", { reason: "idle_timeout" });
            cur.writer.end();
          }
          void checkpointer.deleteThread(sessionId);
          sessionStore.delete(sessionId);
        });

        const ping = setInterval(() => {
          if (!safeSSEvent(writer, "ping", {})) {
            clearInterval(ping);
          }
        }, 20000);

        const welcome =
          "안녕하세요! 개발 블로그 도우미입니다. 무엇을 도와드릴까요?";
        safeSSEvent(s.writer, "start", {});
        safeSSEvent(s.writer, "chunk", { type: "response", text: welcome });
        safeSSEvent(s.writer, "end", { fullResponse: welcome });

        const onAbort = () => {
          clearInterval(ping);
          s.abort?.abort();
          s.writer?.end();
          sessionStore.delete(sessionId);
          void checkpointer.deleteThread(sessionId);
        };

        request.signal.addEventListener("abort", onAbort);
      },
      cancel: () => {
        const cur = sessionStore.get(sessionId);
        cur?.abort?.abort();
        cur?.writer?.end();
        sessionStore.delete(sessionId);
        void checkpointer.deleteThread(sessionId);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  };

  sendMessage = async (request: NextRequest) => {
    const { sessionId, message, systemContext, isDBAllowed } = (await request
      .json()
      .catch(() => ({}))) as {
      sessionId?: string;
      message?: string;
      systemContext?: string;
      isDBAllowed?: boolean;
    };

    if (!sessionId || typeof message !== "string") {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    const s = sessionStore.get(sessionId);
    if (!s || !s.writer) {
      return NextResponse.json({ error: "invalid session" }, { status: 400 });
    }

    try {
      sessionStore.clearIdleTimer(sessionId);
      safeSSEvent(s.writer, "start", {});

      let fullResponse = "";
      let fullReasoning = "";
      let reasoningTokens = 0;
      let reasoningBuffer = "";

      const agent = createAgent(!!isDBAllowed);
      const eventStream = agent.streamEvents(
        {
          messages: [
            new HumanMessage(
              message + ` (Tools : ${isDBAllowed ? "Allowed" : "Prohibited"})`
            ),
          ],
        },
        {
          version: "v2",
          signal: s.abort?.signal,
          configurable: { thread_id: sessionId, systemContext, isDBAllowed },
        }
      );

      for await (const event of eventStream as AsyncIterable<unknown>) {
        if (isToolStartEvent(event)) {
          const { name, data } = event;
          const input = (data as any)?.input;
          safeSSEvent(s.writer, "tool_start", { name, input });
          continue;
        }
        if (isToolEndEvent(event)) {
          const { name } = event;
          safeSSEvent(s.writer, "tool_end", { name });
          continue;
        }

        if (isChatStreamEvent(event)) {
          const chunk = (event as any).data?.chunk as any;
          if (!chunk) continue;

          if (typeof chunk.content === "string" && chunk.content) {
            fullResponse += chunk.content;
            safeSSEvent(s.writer, "chunk", {
              type: "response",
              text: chunk.content,
            });
          }

          if (Array.isArray(chunk.content)) {
            for (const block of chunk.content) {
              if (
                typeof block === "object" &&
                block !== null &&
                "text" in block &&
                typeof (block as { text: unknown }).text === "string"
              ) {
                const text = (block as { text: string }).text;
                fullResponse += text;
                safeSSEvent(s.writer, "chunk", { type: "response", text });
              }
            }
          }

          const kw = isObject(chunk.additional_kwargs)
            ? (chunk.additional_kwargs as Record<string, unknown>)
            : undefined;
          const reasoning = kw?.reasoning as
            | { summary?: Array<{ type?: string; text?: string }> }
            | undefined;
          if (reasoning?.summary && Array.isArray(reasoning.summary)) {
            for (const part of reasoning.summary) {
              if (
                (part as any)?.type === "summary_text" &&
                typeof (part as any)?.text === "string" &&
                (part as any).text
              ) {
                const text = (part as any).text as string;
                reasoningBuffer += text;
                safeSSEvent(s.writer, "reasoning", {
                  type: "reasoning",
                  text,
                  isThinking: true,
                });
              }
            }
          }
          continue;
        }

        if (isChatEndEvent(event)) {
          const output = (event as any).data?.output as any;
          const md =
            (output?.response_metadata as
              | Record<string, unknown>
              | undefined) ||
            (output?.additional_kwargs as Record<string, unknown> | undefined);

          if (reasoningBuffer && !fullReasoning) {
            fullReasoning = reasoningBuffer;
            safeSSEvent(s.writer, "reasoning_complete", {
              type: "reasoning_complete",
              summary: fullReasoning,
            });
          }

          const metaSummary =
            (md &&
            Array.isArray(
              (md as { reasoning_summary?: unknown }).reasoning_summary
            )
              ? (md as { reasoning_summary?: Array<{ text?: string }> })
                  .reasoning_summary
              : undefined) ||
            (md && isObject((md as { reasoning?: unknown }).reasoning)
              ? (md as { reasoning?: { summary?: Array<{ text?: string }> } })
                  .reasoning?.summary
              : undefined);
          if (!fullReasoning && Array.isArray(metaSummary)) {
            fullReasoning = metaSummary
              .map((p) => (typeof p?.text === "string" ? p.text : ""))
              .filter(Boolean)
              .join("");
            safeSSEvent(s.writer, "reasoning_summary", {
              type: "reasoning_summary",
              summary: fullReasoning,
            });
          }

          const usageA =
            md && isObject((md as { usage?: unknown }).usage)
              ? (md as { usage?: { reasoning_tokens?: number } }).usage
              : undefined;
          const usageB = output?.usage_metadata as
            | { reasoning_tokens?: number }
            | undefined;
          const rt = usageA?.reasoning_tokens ?? usageB?.reasoning_tokens;
          if (typeof rt === "number") {
            reasoningTokens = rt;
          }
          continue;
        }
      }

      safeSSEvent(s.writer, "end", {
        fullResponse,
        reasoningSummary: fullReasoning || "No reasoning summary available",
        reasoningTokens,
        metadata: { model: MODEL_NAME, reasoningEffort: "high" },
      });

      return NextResponse.json({ ok: true });
    } catch (err: unknown) {
      const aborted =
        (err instanceof Error &&
          (err.name === "AbortError" || err.message === "Abort")) ||
        s.abort?.signal?.aborted;
      if (aborted) {
        return NextResponse.json({ ok: true, aborted: true });
      }
      safeSSEvent(s.writer, "error", {
        message: "응답 생성 중 오류가 발생했습니다.",
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        {
          error: "failed to generate",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    } finally {
      if (sessionStore.has(sessionId)) {
        sessionStore.setIdleTimer(sessionId, SESSION_IDLE_TIMEOUT_MS, () => {
          const cur = sessionStore.get(sessionId);
          cur?.abort?.abort();
          if (cur?.writer) {
            safeSSEvent(cur.writer, "expired", { reason: "idle_timeout" });
            cur.writer.end();
          }
          void checkpointer.deleteThread(sessionId);
          sessionStore.delete(sessionId);
        });
      }
    }
  };

  // 세션을 유지하고 히스토리를 클리어
  clearHistory = async (request: NextRequest) => {
    const { sessionId } = (await request.json().catch(() => ({}))) as {
      sessionId?: string;
    };
    const s = sessionId ? sessionStore.get(sessionId) : undefined;

    if (!s) {
      return NextResponse.json({ error: "invalid session" }, { status: 400 });
    }

    await s.history.clear();
    await checkpointer.deleteThread(sessionId!);

    safeSSEvent(s.writer, "start", {});
    safeSSEvent(s.writer, "chunk", {
      text: "대화를 초기화했습니다.",
      type: "response",
    });
    safeSSEvent(s.writer, "end", { fullResponse: "대화를 초기화했습니다." });

    return NextResponse.json({ ok: true });
  };
}
