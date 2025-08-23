"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SSEChunk = { type?: string; text?: string };
type Message = { id: string; from: "user" | "assistant"; text: string };
type ToolEvent = { name?: string };
type ReasoningEvent = { text?: string; summary?: string };
type ErrorEvent = { message?: string };
type EndEvent = { fullResponse?: string };

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [systemContext, setSystemContext] = useState<string>("");
  const [isDBAllowed, setIsDBAllowed] = useState<boolean>(false);
  const [expired, setExpired] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [streamReady, setStreamReady] = useState<boolean>(false);

  const esRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canInteract = useMemo(
    () => Boolean(sessionId) && !expired && streamReady,
    [sessionId, expired, streamReady]
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    let aborted = false;

    const start = async () => {
      try {
        const res = await fetch("/api/chat/session", { method: "POST" });
        if (!res.ok) throw new Error("세션 생성 실패");
        const data = (await res.json()) as { sessionId: string };
        if (aborted) return;
        setSessionId(data.sessionId);

        const es = new EventSource(
          `/api/chat/stream?sessionId=${encodeURIComponent(data.sessionId)}`
        );
        esRef.current = es;

        // 로컬 버퍼로 스트리밍 텍스트를 누적하여 의존성 경고 없이 end에서 사용
        let buffer = "";

        es.addEventListener("ping", () => {});

        es.addEventListener("start", () => {
          // 새 스트림 시작 - 이제 메시지를 안전하게 보낼 수 있습니다
          setStreamingText("");
          setStreamReady(true);
        });

        es.addEventListener("chunk", (ev) => {
          try {
            const payload = JSON.parse((ev as MessageEvent).data) as SSEChunk;
            if (payload?.text) {
              setStreamingText((prev) => prev + payload.text);
              buffer += payload.text;
            }
          } catch {}
        });

        const handleToolEvent = (eventType: "start" | "end", ev: Event) => {
          try {
            const payload = JSON.parse((ev as MessageEvent).data) as ToolEvent;
            if (payload?.name) {
              const message = eventType === "start" ? "시작" : "종료";
              setStreamingText(prev => prev + `\n[도구 ${message}] ${payload.name}`);
            }
          } catch {}
        };

        es.addEventListener("tool_start", (ev) => handleToolEvent("start", ev));
        es.addEventListener("tool_end", (ev) => handleToolEvent("end", ev));

        es.addEventListener("reasoning", (ev) => {
          try {
            const payload = JSON.parse((ev as MessageEvent).data) as {
              text?: string;
            };
            if (payload?.text) setReasoning((prev) => prev + payload.text);
          } catch {}
        });

        const handleReasoningEvent = (ev: Event) => {
          try {
            const payload = JSON.parse((ev as MessageEvent).data) as ReasoningEvent;
            if (payload?.summary) setReasoning(payload.summary);
          } catch {}
        };

        es.addEventListener("reasoning_complete", handleReasoningEvent);
        es.addEventListener("reasoning_summary", handleReasoningEvent);

        es.addEventListener("end", (ev) => {
          try {
            const payload = JSON.parse((ev as MessageEvent).data) as EndEvent;
            const finalText = payload?.fullResponse ?? buffer;
            if (finalText) {
              setMessages(prev => [...prev, { 
                id: crypto.randomUUID(), 
                from: "assistant", 
                text: finalText 
              }]);
            }
          } catch {
            if (buffer) {
              setMessages(prev => [...prev, { 
                id: crypto.randomUUID(), 
                from: "assistant", 
                text: buffer 
              }]);
            }
          } finally {
            setStreamingText("");
          }
        });

        es.addEventListener("error", (ev) => {
          try {
            const payload = JSON.parse((ev as MessageEvent).data) as ErrorEvent;
            const msg = payload?.message ?? "스트리밍 오류";
            setStreamingText(prev => prev ? `${prev}\n[오류] ${msg}` : `[오류] ${msg}`);
          } catch {}
          setStreamReady(false);
        });

        es.addEventListener("expired", () => {
          setExpired(true);
          setStreamingText(prev => prev ? `${prev}\n[세션 만료]` : "[세션 만료]");
          setStreamReady(false);
          es.close();
          esRef.current = null;
        });
      } catch (_e) {
        console.error(_e);
      }
    };

    start();

    return () => {
      aborted = true;
      setStreamReady(false);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);

  const onSend = async () => {
    if (!sessionId || !input.trim() || sending || expired || !streamReady) return;
    setSending(true);
    setReasoning("");
    const text = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), from: "user", text },
    ]);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          systemContext,
          isDBAllowed,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err?.error || "전송 실패");
      }
    } catch (_e) {
      // Restore original message on failure
      setInput(text);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "assistant",
          text: "전송 중 오류가 발생했습니다. 다시 시도해주세요.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onClear = async () => {
    if (!sessionId || expired) return;
    try {
      await fetch("/api/chat/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setMessages([]);
      setStreamingText("");
      setReasoning("");
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🤖 개발 블로그 챗봇
          </h1>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>세션: {sessionId ?? "생성 중..."}</span>
            {expired && (
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-900 dark:text-red-300">
                만료됨
              </span>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            설정
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                추가 컨텍스트
              </label>
              <textarea
                placeholder="시스템에게 전달할 추가 컨텍스트를 입력하세요..."
                value={systemContext}
                onChange={(e) => setSystemContext(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400"
              />
            </div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isDBAllowed}
                onChange={(e) => setIsDBAllowed(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                DB/Tools 사용 허용
              </span>
            </label>
          </div>
        </div>

        {/* Chat Container */}
        <div className="rounded-xl bg-white shadow-lg dark:bg-gray-800">
          {/* Messages */}
          <div className="max-h-96 space-y-4 overflow-y-auto p-6" id="messages-container">
            {messages.length === 0 && !streamingText && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl">💬</div>
                <p className="mt-2">대화를 시작해보세요!</p>
              </div>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  m.from === "user" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                }`}>
                  <div className="mb-1 text-xs font-medium opacity-75">
                    {m.from === "user" ? "나" : "챗봇"}
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            
            {streamingText && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium opacity-75">
                    <span>챗봇</span>
                    <div className="flex space-x-1">
                      <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                      <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {streamingText}
                  </div>
                </div>
              </div>
            )}
            
            {reasoning && (
              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <div className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  🧠 생각 과정
                </div>
                <div className="whitespace-pre-wrap text-sm text-yellow-700 dark:text-yellow-300">
                  {reasoning}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="flex space-x-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder={
                  expired ? "세션이 만료되었습니다." : "메시지를 입력하세요..."
                }
                disabled={!canInteract}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:disabled:bg-gray-800"
              />
              <button
                onClick={onSend}
                disabled={!canInteract || sending || !input.trim()}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-600"
              >
                {sending ? "전송중..." : "전송"}
              </button>
              <button
                onClick={onClear}
                disabled={!canInteract}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:bg-gray-800"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
