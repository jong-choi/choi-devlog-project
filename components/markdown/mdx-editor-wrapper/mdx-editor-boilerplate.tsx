import React from "react";
import { LeafDirective } from "mdast-util-directive";
import {
  DirectiveDescriptor,
  toolbarPlugin,
  KitchenSinkToolbar,
  listsPlugin,
  quotePlugin,
  headingsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  diffSourcePlugin,
  markdownShortcutPlugin,
} from "@mdxeditor/editor";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

export async function expressImageUploadHandler(image: File) {
  const formData = new FormData();
  formData.append("image", image);
  const response = await fetch("/uploads/new", {
    method: "POST",
    body: formData,
  });
  const json = (await response.json()) as { url: string };
  return json.url;
}

interface YoutubeDirectiveNode extends LeafDirective {
  name: "youtube";
  attributes: { id: string };
}

export const YoutubeDirectiveDescriptor: DirectiveDescriptor<YoutubeDirectiveNode> =
  {
    name: "youtube",
    type: "leafDirective",
    testNode(node) {
      return node.name === "youtube";
    },
    attributes: ["id"],
    hasChildren: false,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <button
            onClick={() => {
              parentEditor.update(() => {
                lexicalNode.selectNext();
                lexicalNode.remove();
              });
            }}
          >
            delete
          </button>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${mdastNode.attributes.id}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      );
    },
  };

export const ALL_PLUGINS = [
  toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
  linkPlugin(),
  linkDialogPlugin(),
  imagePlugin({
    imageAutocompleteSuggestions: [
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
    ],
    imageUploadHandler: async () =>
      Promise.resolve("https://picsum.photos/200/300"),
  }),
  tablePlugin(),
  thematicBreakPlugin(),
  frontmatterPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      js: "JavaScript",
      css: "CSS",
      txt: "Plain Text",
      tsx: "TypeScript",
      "": "Unspecified",
    },
    codeMirrorExtensions: [vscodeDark],
  }),
  directivesPlugin({
    directiveDescriptors: [
      YoutubeDirectiveDescriptor,
      AdmonitionDirectiveDescriptor,
    ],
  }),
  diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "boo" }),
  markdownShortcutPlugin(),
];
