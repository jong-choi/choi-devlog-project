//MdxEditorComponent
import { ALL_PLUGINS } from "@/components/markdown/mdx-editor-wrapper/mdeditor-boilerplate";
import { MDXEditor } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "@/components/markdown/mdx-editor-wrapper/mdx-editor-wrapper.module.css";

export default function MdxEditorWrapper({ markdown }: { markdown: string }) {
  return (
    <MDXEditor
      className="markdown-body new-york mdxeditor"
      markdown={markdown}
      spellCheck={false}
      onChange={(md) => {
        console.log("change", { md });
      }}
      plugins={ALL_PLUGINS}
    />
  );
}
