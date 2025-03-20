import React from "react";
import {
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
  diffSourcePlugin,
  markdownShortcutPlugin,
  CodeBlockEditorDescriptor,
  useCodeBlockEditorContext,
} from "@mdxeditor/editor";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  // always use the editor, no matter the language or the meta of the code block
  match: (_language, _meta) => true,
  // You can have multiple editors with different priorities, so that there's a "catch-all" editor (with the lowest priority)
  priority: 0,
  // The Editor is a React component
  Editor: (props) => {
    const cb = useCodeBlockEditorContext();
    // stops the propagation so that the parent lexical editor does not handle certain events.
    return (
      <div onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
        <textarea
          rows={3}
          cols={20}
          defaultValue={props.code}
          onChange={(e) => cb.setCode(e.target.value)}
        />
      </div>
    );
  },
};

export const ALL_PLUGINS = [
  toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
  linkPlugin(),
  linkDialogPlugin(),
  imagePlugin(),
  tablePlugin(),
  thematicBreakPlugin(),
  frontmatterPlugin(),
  codeBlockPlugin({
    defaultCodeBlockLanguage: "",
    codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor],
  }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      js: "JavaScript",
      ts: "TypeScript",
      tsx: "TypeScript JSX",
      jsx: "JavaScript JSX",
      py: "Python",
      java: "Java",
      cpp: "C++",
      c: "C",
      cs: "C#",
      go: "Go",
      rust: "Rust",
      swift: "Swift",
      kotlin: "Kotlin",
      php: "PHP",
      rb: "Ruby",
      lua: "Lua",
      dart: "Dart",
      scala: "Scala",
      r: "R",
      perl: "Perl",

      // 웹 관련 언어
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      less: "Less",
      json: "JSON",
      yaml: "YAML",
      xml: "XML",
      md: "Markdown",
      markdown: "Markdown",

      // 데이터베이스 & Query 언어
      sql: "SQL",
      graphql: "GraphQL",
      postgressql: "SQL",
      gql: "GraphQL",
      // Shell & 명령어
      sh: "Shell Script",
      bash: "Bash",
      zsh: "Zsh",
      powershell: "PowerShell",
      bat: "Batch",

      // DevOps & 설정 파일
      ini: "INI",
      toml: "TOML",
      dockerfile: "Dockerfile",
      makefile: "Makefile",
      nginx: "Nginx Config",
      apache: "Apache Config",

      // 기타 유용한 언어들
      txt: "Plain Text",
      "": "Unspecified",
    },
    codeMirrorExtensions: [vscodeDark],
  }),
  diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "boo" }),
  markdownShortcutPlugin(),
];
