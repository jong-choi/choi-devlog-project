"use client";

import { useCallback } from "react";
import { editorViewCtx, parserCtx } from "@milkdown/kit/core";
import { Ctx } from "@milkdown/kit/ctx";
import { Slice } from "@milkdown/kit/prose/model";
import { clearHighlight } from "@/lib/milkdown/plugins/highlight-plugin";
import { useAiInlineStore } from "@/providers/ai-inline-store-provider";

interface UseInlineAiOptions {
  getSelectionMarkdown: () => string;
  getFullMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
}

export function useInlineAi({
  getSelectionMarkdown,
  getFullMarkdown,
  setMarkdown,
}: UseInlineAiOptions) {
  const setLoading = useAiInlineStore((s) => s.setLoading);
  const closeDock = useAiInlineStore((s) => s.closeDock);

  const submit = useCallback(
    (prompt: string, ctx: Ctx) => {
      const view = ctx.get(editorViewCtx);
      view.focus();

      const selectionMarkdown = getSelectionMarkdown();
      setLoading(true);

      fetch("/api/chat/inline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, selectionMarkdown }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Inline API failed");
          const data: { text?: string } = await res.json();
          const replaced = (data.text ?? "").trim();
          if (!replaced) return;

          const parser = ctx.get(parserCtx);
          const doc = parser(replaced);
          if (!doc) return;

          const tr = view.state.tr.replaceSelection(
            new Slice(doc.content, 0, 0),
          );
          view.dispatch(tr);
          try {
            view.focus();
          } catch (_) {}

          // 즉시 부모 상태 업데이트 (포커스와 무관)
          const full = getFullMarkdown();
          setMarkdown(full);
        })
        .catch((e) => {
          console.error("inline replace error", e);
        })
        .finally(() => {
          clearHighlight(view);
          closeDock();
          setLoading(false);
        });
    },
    [getSelectionMarkdown, getFullMarkdown, setMarkdown, setLoading, closeDock],
  );

  return { submit };
}
