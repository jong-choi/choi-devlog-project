import React, { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx, parserCtx } from "@milkdown/kit/core";
import { Ctx } from "@milkdown/kit/ctx";
import { Slice } from "@milkdown/kit/prose/model";
import { Selection } from "@milkdown/kit/prose/state";
import { Milkdown, useEditor } from "@milkdown/react";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

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

  const [body, setBody] = useState<string>(markdown);

  useEffect(() => {
    if (isFocused) {
      setMarkdown(body);
    }
  }, [body, isFocused, setMarkdown]);

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
            builder.clear(); // 툴바 버튼들 삭제
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
              onRun: (ctx: Ctx) => {},
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

  return <Milkdown />;
};

export default MilkdownEditor;
