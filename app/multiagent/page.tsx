"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SSEChunk = { type?: string; text?: string };
type Message = { id: string; from: "user" | "assistant"; text: string };
type ErrorEvent = { message?: string };

type RequestType = "search" | "summary" | "chat";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<RequestType>("chat");
  const [keyword, setKeyword] = useState<string>("");
  const [postId, setPostId] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const [nodeEvents, setNodeEvents] = useState<
    Array<{ type: "start" | "end"; node: string; at: number }>
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const finalAddedRef = useRef<boolean>(false);

  const canInteract = useMemo(
    () => Boolean(sessionId) && !sending,
    [sessionId, sending]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // 세션 ID를 클라이언트에서 생성하여 멀티에이전트 라우트의 thread_id로 사용
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  const parseSSE = (raw: string): Array<{ event?: string; data?: unknown }> => {
    const items: Array<{ event?: string; data?: unknown }> = [];
    const blocks = raw.split("\n\n");
    for (const block of blocks) {
      const lines = block.split("\n");
      let event: string | undefined;
      let dataStr = "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataStr = line.slice(5).trim();
        }
      }
      if (event) {
        let data: unknown = undefined;
        if (dataStr) {
          try {
            data = JSON.parse(dataStr);
          } catch {
            data = dataStr;
          }
        }
        items.push({ event, data });
      }
    }
    return items;
  };

  const onSend = async () => {
    if (!sessionId || !input.trim() || sending) return;
    if (selectedType === "search" && !keyword.trim()) {
      setErrorText("검색어를 입력하세요.");
      return;
    }
    if (selectedType === "summary" && !postId.trim()) {
      setErrorText("요약할 post_id를 입력하세요.");
      return;
    }
    setErrorText("");
    setSending(true);
    const text = input.trim();
    setInput("");
    setStreamingText("");
    setNodeEvents([]);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), from: "user", text },
    ]);

    try {
      const ctrl = new AbortController();
      controllerRef.current = ctrl;
      const res = await fetch("/api/multiagent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          context: {
            type: selectedType,
            keyword: selectedType === "search" ? keyword.trim() : undefined,
            post_id: selectedType === "summary" ? postId.trim() : undefined,
          },
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("스트리밍 시작 실패");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let finalBuffer = "";
      // 스트림 읽기 및 SSE 파싱
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const chunks = buf.split("\n\n");
        buf = chunks.pop() || "";
        for (const chunk of chunks) {
          const parsed = parseSSE(chunk + "\n\n");
          for (const { event, data } of parsed) {
            if (!event) continue;
            switch (event) {
              case "start": {
                setStreamingText("");
                setNodeEvents([]);
                break;
              }
              case "chunk": {
                const t = (data as SSEChunk)?.text || "";
                if (t) {
                  setStreamingText((prev) => prev + t);
                  finalBuffer += t;
                }
                break;
              }
              case "node_start": {
                const node = (data as { node?: string })?.node;
                if (node)
                  setNodeEvents((prev) => [
                    ...prev,
                    { type: "start", node, at: Date.now() },
                  ]);
                break;
              }
              case "node_end": {
                const node = (data as { node?: string })?.node;
                if (node)
                  setNodeEvents((prev) => [
                    ...prev,
                    { type: "end", node, at: Date.now() },
                  ]);
                break;
              }
              case "task_completed": {
                const resp = (data as { response?: unknown })?.response;
                const text = typeof resp === "string" ? resp : "";
                if (text) {
                  setMessages((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), from: "assistant", text },
                  ]);
                  setStreamingText("");
                  finalAddedRef.current = true;
                }
                break;
              }
              case "error": {
                const msg = (data as ErrorEvent)?.message || "오류";
                setStreamingText((prev) =>
                  prev ? `${prev}\n[오류] ${msg}` : `[오류] ${msg}`
                );
                setErrorText(msg);
                break;
              }
              case "end": {
                // task_completed에서 이미 메시지를 보냈다면 종료 메시지는 무시
                if (!finalAddedRef.current) {
                  const msgCandidate = (data as { message?: unknown })?.message;
                  const endMsg =
                    typeof msgCandidate === "string" ? msgCandidate : "";
                  // '완료되었습니다.' 같은 상태 문구는 메시지로 추가하지 않음
                  const finalText =
                    finalBuffer && endMsg !== "완료되었습니다."
                      ? finalBuffer
                      : finalBuffer;
                  if (finalText) {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: crypto.randomUUID(),
                        from: "assistant",
                        text: finalText,
                      },
                    ]);
                  }
                }
                setStreamingText("");
                break;
              }
            }
          }
        }
      }
    } catch (_e) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "assistant",
          text: "요청 처리 중 오류가 발생했습니다.",
        },
      ]);
      if (_e instanceof Error) setErrorText(_e.message);
    } finally {
      setSending(false);
      controllerRef.current = null;
    }
  };

  const onClear = () => {
    setMessages([]);
    setStreamingText("");
    setNodeEvents([]);
    setErrorText("");
  };

  const onStop = () => {
    controllerRef.current?.abort();
  };

  const onNewSession = () => {
    setSessionId(crypto.randomUUID());
    onClear();
    setInput("");
    setKeyword("");
    setPostId("");
  };

  const searchExamples = [
    "React 상태관리 정리",
    "Next.js 이미지 최적화",
    "Zustand 베스트 프랙티스",
  ];
  const chatExamples = [
    "이 블로그의 카테고리 구성 설명해줘",
    "최신 글 3개 알려줘",
  ];

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
            <button
              onClick={onNewSession}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              새 세션
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            멀티에이전트 설정
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                타입
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as RequestType)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              >
                <option value="chat">chat</option>
                <option value="search">search</option>
                <option value="summary">summary</option>
              </select>
            </div>

            {selectedType === "search" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  검색어(keyword)
                </label>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: React"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {searchExamples.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setSelectedType("search");
                        setKeyword(ex);
                      }}
                      className="rounded-full border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedType === "summary" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  포스트 ID (post_id)
                </label>
                <input
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                  placeholder="예: 123"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>
            )}
          </div>
          {selectedType === "chat" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {chatExamples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setInput(ex)}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
          {errorText && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
              {errorText}
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="rounded-xl bg-white shadow-lg dark:bg-gray-800">
          {/* Messages */}
          <div
            className="max-h-96 space-y-4 overflow-y-auto p-6"
            id="messages-container"
          >
            {messages.length === 0 && !streamingText && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl">💬</div>
                <p className="mt-2">대화를 시작해보세요!</p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    m.from === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  }`}
                >
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
                      <div
                        className="h-1 w-1 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="h-1 w-1 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {streamingText}
                  </div>
                  {nodeEvents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {nodeEvents.map((e, idx) => (
                        <span
                          key={`${e.node}-${e.type}-${idx}`}
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            e.type === "start"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                          }`}
                        >
                          {e.node} {e.type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder={"메시지를 입력하세요..."}
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
                onClick={onStop}
                disabled={!sending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:bg-gray-800"
              >
                중지
              </button>
              <button
                onClick={onClear}
                disabled={!canInteract}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:bg-gray-800"
              >
                초기화
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter로 전송, Shift+Enter로 줄바꿈.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
