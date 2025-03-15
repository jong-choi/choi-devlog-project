//MdxEditorComponent
import { MDXEditor } from "@mdxeditor/editor";
import { ALL_PLUGINS } from "@/components/markdown/mdx-editor-wrapper/mdx-editor-boilerplate";
import "@mdxeditor/editor/style.css";
import "@/components/markdown/mdx-editor-wrapper/mdx-editor-wrapper.module.css";

export default function MdxEditorWrapper({ markdown }: { markdown: string }) {
  return (
    <MDXEditor
      className="mdxeditor"
      markdown={markdown}
      spellCheck={false}
      onChange={(_md) => {}}
      plugins={ALL_PLUGINS}
    />
  );
}
