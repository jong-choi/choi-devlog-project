import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Ctx } from "@milkdown/kit/ctx";
import { editorViewCtx } from "@milkdown/kit/core";
import { cn } from "@/lib/utils";
import { useAiInlineStore } from "@/providers/ai-inline-store-provider";
import { clearHighlight } from "./highlight-plugin";

interface AiInlineDockProps {
  onSubmit: (prompt: string, ctx: Ctx) => void;
}

export default function AiInlineDock({
  onSubmit,
}: AiInlineDockProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [prompt, setPrompt] = useState<string>("");

  // 전역 상태 사용
  const isOpen = useAiInlineStore((state) => state.isOpen);
  const isLoading = useAiInlineStore((state) => state.isLoading);
  const position = useAiInlineStore((state) => state.position);
  const ctx = useAiInlineStore((state) => state.ctx);
  const closeDock = useAiInlineStore((state) => state.closeDock);

  // 독 닫기 핸들러
  const handleClose = useCallback(() => {
    // 하이라이트 제거
    if (ctx) {
      const view = ctx.get(editorViewCtx);
      clearHighlight(view);
    }
    closeDock();
  }, [ctx, closeDock]);

  // 바깥 클릭으로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, handleClose]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = useCallback(() => {
    if (!ctx) return;
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onSubmit(trimmed, ctx);
    setPrompt("");
  }, [ctx, onSubmit, prompt]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute z-50 w-[320px] max-w-[80vw]"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, calc(-100% - 8px))", // 기준점 위쪽에 살짝 띄우기
      }}
      aria-label="AI 인라인 편집 독"
      role="dialog"
    >
      <div className="relative">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className={cn(
            "w-full min-h-[42px] rounded-xl border border-neutral-400 bg-white shadow-sm",
            "dark:border-neutral-500 dark:bg-neutral-900",
            "placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-sm text-neutral-900 dark:text-neutral-100",
            "py-3 px-4 pr-12 focus:outline-none",
          )}
          placeholder="AI에게 편집 요청하기..."
          autoFocus
        />
        <button
          type="button"
          disabled={!ctx || !prompt.trim() || isLoading}
          onClick={handleSubmit}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg flex items-center justify-center",
            "bg-neutral-700 hover:bg-neutral-800 disabled:bg-neutral-300 dark:disabled:bg-neutral-600",
            "transition-colors disabled:cursor-not-allowed",
          )}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
