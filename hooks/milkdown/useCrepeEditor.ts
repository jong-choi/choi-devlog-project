"use client";

import { useRef } from "react";
import { EditorView } from "@codemirror/view";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx } from "@milkdown/kit/core";
import { Ctx } from "@milkdown/kit/ctx";
import { useEditor } from "@milkdown/react";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { highlightPlugin } from "@/lib/milkdown/plugins/highlight-plugin";

type DockOpenHandler = (params: {
  ctx: Ctx;
  x: number;
  y: number;
  from: number;
  to: number;
}) => void;

interface UseCrepeEditorOptions {
  initialMarkdown: string;
  onImageUpload?: (file: File) => Promise<string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMarkdownUpdated: (markdown: string) => void;
  onAiToolbarOpen: DockOpenHandler;
  toolbarOffset?: { x?: number; y?: number };
}

export function useCrepeEditor(options: UseCrepeEditorOptions) {
  const {
    initialMarkdown,
    onImageUpload,
    containerRef,
    onMarkdownUpdated,
    onAiToolbarOpen,
    toolbarOffset,
  } = options;

  const crepeRef = useRef<Crepe | null>(null);

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: initialMarkdown,
      featureConfigs: {
        [Crepe.Feature.ImageBlock]: {
          async blockOnUpload(file) {
            if (!onImageUpload) return "";
            const url = await onImageUpload(file);
            return url;
          },
        },
        [Crepe.Feature.CodeMirror]: {
          extensions: [EditorView.lineWrapping],
          theme: vscodeDark,
        },
        [Crepe.Feature.Toolbar]: {
          buildToolbar: (builder) => {
            builder.addGroup("ai", "AI");
            const functionGroup = builder.getGroup("ai");
            functionGroup.addItem("ai-improve", {
              icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="currentColor" opacity="0.12" /><text x="12" y="16" text-anchor="middle" font-size="10" font-family="sans-serif">AI</text></svg>`,
              active: () => true,
              onRun: (ctx: Ctx) => {
                const view = ctx.get(editorViewCtx);
                const { from, to } = view.state.selection;
                const { left, bottom } = view.coordsAtPos(from);

                const container = containerRef.current;
                if (!container) return;
                const rect = container.getBoundingClientRect();
                const offsetY = toolbarOffset?.y ?? -70;
                const offsetX = toolbarOffset?.x ?? 150;

                const x = left - rect.left + offsetX;
                const y = bottom - rect.top + offsetY;

                onAiToolbarOpen({ ctx, x, y, from, to });
              },
            });
          },
        },
      },
    });

    // 하이라이트 플러그인 항상 추가
    crepe.editor.use(highlightPlugin);

    // 마크다운 업데이트 이벤트 전달
    crepe.on((listener) => {
      listener.markdownUpdated((_, updatedMarkdown, prevMarkdown) => {
        if (updatedMarkdown !== prevMarkdown) {
          const cleaned = updatedMarkdown.replace(
            /<br\s*\/?>(?=\n|$)/gi,
            "&nbsp;",
          );
          onMarkdownUpdated(cleaned);
        }
      });
    });

    crepeRef.current = crepe;
    return crepe;
  }, []);

  return { crepeRef };
}
