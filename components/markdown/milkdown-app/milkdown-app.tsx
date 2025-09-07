import React, { useEffect, useRef, useState } from "react";
import { editorViewCtx } from "@milkdown/kit/core";
import { Milkdown } from "@milkdown/react";
import "@/components/markdown/styles/milkdown-ai-highliting.css";
import { useCrepeEditor } from "@/hooks/milkdown/useCrepeEditor";
import { useHighlightSync } from "@/hooks/milkdown/useHighlightSync";
import { useInlineAi } from "@/hooks/milkdown/useInlineAi";
import { useMilkdownSync } from "@/hooks/milkdown/useMilkdownSync";
import { setHighlight as setHighlightPlugin } from "@/lib/milkdown/plugins/highlight-plugin";
import { useAiInlineStore } from "@/providers/ai-inline-store-provider";
import AiInlineDock from "./ai-inline-dock";

const MilkdownEditor = ({
  markdown,
  setMarkdown,
  onImageUpload,
  isFocused,
}: {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  isFocused: boolean;
}) => {
  const uploadImageToServer = async (_file: File) => {
    return "";
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [body, setBody] = useState<string>(markdown);

  const openDock = useAiInlineStore((state) => state.openDock);
  const setHighlight = useAiInlineStore((state) => state.setHighlight);
  const isOpen = useAiInlineStore((state) => state.isOpen);
  const highlightEnabled = useAiInlineStore((state) => state.highlightEnabled);
  const selectedRange = useAiInlineStore((state) => state.selectedRange);

  // Crepe 에디터 초기화 훅
  const { crepeRef } = useCrepeEditor({
    initialMarkdown: markdown,
    onImageUpload: onImageUpload ?? uploadImageToServer,
    containerRef,
    onMarkdownUpdated: (updated) => setBody(updated),
    onAiToolbarOpen: ({ ctx, x, y, from, to }) => {
      const view = ctx.get(editorViewCtx);
      if (from !== to) setHighlightPlugin(view, from, to);
      setHighlight(true, { from, to });
      openDock(x, y, ctx);
    },
  });

  // 인라인 AI 제출 훅
  const { submit: handleAiSubmit } = useInlineAi({
    getSelectionMarkdown: () =>
      crepeRef.current?.editor?.action?.(
        (ctx: import("@milkdown/kit/ctx").Ctx) => {
          const view = ctx.get(editorViewCtx);
          const { from, to } = view.state.selection;
          return view.state.doc.textBetween(from, to, "\n");
        },
      ) ?? "",
    getFullMarkdown: () =>
      crepeRef.current?.editor?.action?.(
        (ctx: import("@milkdown/kit/ctx").Ctx) => {
          const view = ctx.get(editorViewCtx);
          return view.state.doc.textBetween(
            0,
            view.state.doc.content.size,
            "\n",
          );
        },
      ) ?? body,
    setMarkdown,
  });

  useEffect(() => {
    if (isFocused) {
      setMarkdown(body);
    }
  }, [body, isFocused, setMarkdown]);

  useMilkdownSync({
    editorRef: crepeRef,
    isFocused,
    markdown,
    onBodyChange: setMarkdown,
  });

  useHighlightSync({
    editorRef: crepeRef,
    enabled: highlightEnabled,
    isDockOpen: isOpen,
    range: selectedRange,
  });

  return (
    <div ref={containerRef} className="relative">
      <Milkdown />
      <AiInlineDock onSubmit={handleAiSubmit} />
    </div>
  );
};

export default MilkdownEditor;
