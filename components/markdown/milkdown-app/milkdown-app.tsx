import React from "react";
import { Crepe } from "@milkdown/crepe";
import { Milkdown, useEditor } from "@milkdown/react";
import { EditorView } from "@codemirror/view";
import "@milkdown/crepe/theme/common/style.css";
// https://github.com/Milkdown/milkdown/tree/main/packages/crepe/src/theme
import "@/components/markdown/milkdown-app/milkdown-crepe-theme.css";

const MilkdownEditor = ({
  markdown,
  setMarkdown,
  onImageUpload,
}: {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  onFocus?: () => void;
  onImageUpload?: (file: File) => Promise<string>;
}) => {
  const uploadImageToServer = async (_file: File) => {
    return "";
  };

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
        },
      },
    });

    crepe.on((listener) => {
      listener.markdownUpdated((_, updatedMarkdown, prevMarkdown) => {
        if (updatedMarkdown !== prevMarkdown) {
          setMarkdown(updatedMarkdown);
        }
      });
    });

    return crepe;
  }, []);

  return <Milkdown />;
};

export default MilkdownEditor;
