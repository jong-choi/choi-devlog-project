import React, { useEffect, useRef, useState } from "react";
import { Crepe } from "@milkdown/crepe";
import { Milkdown, useEditor } from "@milkdown/react";
import { EditorView } from "@codemirror/view";
import { editorViewCtx, parserCtx } from "@milkdown/kit/core";
import { Slice } from "@milkdown/kit/prose/model";
import { Selection } from "@milkdown/kit/prose/state";
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
            new Slice(doc.content, 0, 0)
          );
          tr = tr.setSelection(Selection.near(tr.doc.resolve(from)));

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
