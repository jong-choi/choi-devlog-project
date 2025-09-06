import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx, parserCtx } from "@milkdown/kit/core";
import { Ctx } from "@milkdown/kit/ctx";
import { Slice } from "@milkdown/kit/prose/model";
import { Selection } from "@milkdown/kit/prose/state";
import { getMarkdown } from "@milkdown/kit/utils";
import { Milkdown, useEditor } from "@milkdown/react";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import "@/components/markdown/styles/milkdown-ai-highliting.css";
import AiInlineDock from "./ai-inline-dock";
import {
  clearHighlight,
  highlightPlugin,
  setHighlight,
} from "./highlight-plugin";

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

  const crepeRef = useRef<Crepe | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [body, setBody] = useState<string>(markdown);
  const [aiDockOpen, setAiDockOpen] = useState<boolean>(false);
  const [aiDockPos, setAiDockPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [aiCtx, setAiCtx] = useState<Ctx | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [highlightEnabled, setHighlightEnabled] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<{
    from: number;
    to: number;
  } | null>(null);

  // AI 제출 핸들러: 선택 영역을 마크다운으로 추출해 로그 출력
  const handleAiSubmit = useCallback((prompt: string, ctx: Ctx) => {
    const editor = crepeRef.current?.editor;
    if (!editor) return;

    // 로딩 시작
    setIsAiLoading(true);

    const view = ctx.get(editorViewCtx);
    const { from, to } = view.state.selection;

    const selectionMarkdown = editor.action(getMarkdown({ from, to }));

    // API 호출하여 변환된 마크다운 수신
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

        // 응답으로 선택 영역을 마크다운으로 교체 (마크다운 -> 노드 파싱 후 치환)
        editor.action((innerCtx) => {
          const innerView = innerCtx.get(editorViewCtx);
          const parser = innerCtx.get(parserCtx);
          const doc = parser(replaced);
          if (!doc) return;

          const tr = innerView.state.tr.replaceSelection(
            new Slice(doc.content, 0, 0),
          );
          innerView.dispatch(tr);
        });
      })
      .catch((e) => {
        console.error("inline replace error", e);
      })
      .finally(() => {
        // 로딩 종료
        setIsAiLoading(false);
        setAiDockOpen(false);
        setHighlightEnabled(false);
        setSelectedRange(null);

        // 하이라이트 제거
        const view = ctx.get(editorViewCtx);
        clearHighlight(view);
      });
  }, []);

  useEffect(() => {
    if (isFocused) {
      setMarkdown(body);
    }
  }, [body, isFocused, setMarkdown]);

  // 하이라이트 상태 관리
  useEffect(() => {
    if (!crepeRef.current || !highlightEnabled) return;

    const editor = crepeRef.current.editor;
    if (!editor) return;

    // 선택 영역이 변경되었을 때 하이라이트 업데이트
    if (selectedRange && aiDockOpen) {
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        setHighlight(view, selectedRange.from, selectedRange.to);
      });
    }
  }, [highlightEnabled, selectedRange, aiDockOpen]);

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: markdown,
      featureConfigs: {
        [Crepe.Feature.ImageBlock]: {
          async blockOnUpload(file) {
            if (!onImageUpload) {
              const imageUrl = await uploadImageToServer(file);
              return imageUrl;
            }
            const imageUrl = await onImageUpload(file);
            return imageUrl;
          },
        },
        [Crepe.Feature.CodeMirror]: {
          extensions: [EditorView.lineWrapping],
          theme: vscodeDark,
        },
        [Crepe.Feature.Toolbar]: {
          buildToolbar: (builder) => {
            // builder.clear(); // 툴바 버튼들 삭제
            builder.addGroup("ai", "AI"); // AI 그룹 추가
            const functionGroup = builder.getGroup("ai");
            functionGroup.addItem("ai-improve", {
              icon: `<svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <rect
                    width="24"
                    height="24"
                    rx="4"
                    fill="currentColor"
                    opacity="0.12"
                  />{" "}
                  <text
                    x="12"
                    y="16"
                    text-anchor="middle"
                    font-size="10"
                    font-family="sans-serif"
                  >
                    AI
                  </text>{" "}
                </svg>`,
              active: () => true, // 활성화 상태
              onRun: (ctx: Ctx) => {
                // 1) 현재 선택 위치(from)의 뷰포트 좌표를 얻습니다.
                const view = ctx.get(editorViewCtx);
                const { from, to } = view.state.selection;
                const { left, bottom } = view.coordsAtPos(from);

                // 2) 에디터 컨테이너 기준 좌표로 환산합니다.
                const container = containerRef.current;
                if (!container) return;
                const rect = container.getBoundingClientRect();
                const offsetY = -70;
                const offsetX = 150;

                const x = left - rect.left + offsetX; // 컨테이너 기준 X
                const y = bottom - rect.top + offsetY; // 컨테이너 기준 Y

                // 3) 선택 영역이 있다면 하이라이트 설정
                if (from !== to) {
                  setHighlight(view, from, to);
                  setHighlightEnabled(true);
                  setSelectedRange({ from, to });
                }

                // 4) 팝업 상태를 열고 좌표/CTX를 반영합니다.
                setAiCtx(ctx);
                setAiDockPos({ x, y });
                setAiDockOpen(true);
              },
            });
          },
        },
      },
    });

    crepe.on((listener) => {
      listener.markdownUpdated((_, updatedMarkdown, prevMarkdown) => {
        if (updatedMarkdown !== prevMarkdown) {
          const cleaned = updatedMarkdown.replace(/<br\s*\/?>/gi, "&nbsp;");
          setBody(cleaned);
        }
      });
    });

    // 하이라이트 플러그인 추가 (항상 활성화)
    crepe.editor.use(highlightPlugin);

    crepeRef.current = crepe;
    return crepe;
  }, []);

  useEffect(() => {
    if (!isFocused && crepeRef.current) {
      try {
        crepeRef.current.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          const parser = ctx.get(parserCtx);
          const doc = parser(markdown);
          if (!doc) return;

          const state = view.state;
          const selection = state.selection;
          const { from } = selection;

          let tr = state.tr;
          tr = tr.replace(
            0,
            state.doc.content.size,
            new Slice(doc.content, 0, 0),
          );

          if (tr.doc.content.size === 0) {
            tr = tr.setSelection(Selection.atStart(tr.doc));
          } else {
            const safePos = Math.min(from, tr.doc.content.size - 1);
            tr = tr.setSelection(Selection.near(tr.doc.resolve(safePos)));
          }

          view.dispatch(tr);
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isFocused, markdown]);

  return (
    <div ref={containerRef} className="relative">
      <Milkdown />
      <AiInlineDock
        open={aiDockOpen}
        x={aiDockPos.x}
        y={aiDockPos.y}
        ctx={aiCtx}
        isLoading={isAiLoading}
        onClose={() => {
          setAiDockOpen(false);
          setHighlightEnabled(false);
          setSelectedRange(null);

          // 하이라이트 제거
          if (aiCtx) {
            const view = aiCtx.get(editorViewCtx);
            clearHighlight(view);
          }
        }}
        onSubmit={handleAiSubmit}
      />
    </div>
  );
};

export default MilkdownEditor;
