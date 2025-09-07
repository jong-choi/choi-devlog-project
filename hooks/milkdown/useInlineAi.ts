"use client";

import { useCallback } from "react";
import { editorViewCtx, parserCtx } from "@milkdown/kit/core";
import { Ctx } from "@milkdown/kit/ctx";
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
  const selectedRange = useAiInlineStore((s) => s.selectedRange);

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
          if (!doc || !selectedRange) return;

          const contentToInsert =
            doc.childCount === 1 && doc.firstChild?.type.name === "paragraph"
              ? doc.firstChild.content
              : doc.content;

          const tr = view.state.tr.replaceWith(
            selectedRange.from,
            selectedRange.to,
            contentToInsert,
          );
          view.dispatch(tr);
          view.focus();

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
    [
      getSelectionMarkdown,
      getFullMarkdown,
      setMarkdown,
      setLoading,
      closeDock,
      selectedRange,
    ],
  );

  return { submit };
}
