"use client";

import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";

export function MarkdownRawEditor({
  value,
  onChange,
  isFocused,
}: {
  value: string;
  onChange: (val: string) => void;
  isFocused: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const initialValueRef = useRef(value);
  const [isDark, setIsDark] = useState(false);
  const [body, setBody] = useState(value);

  useEffect(() => {
    if (isFocused) {
      onChange(body);
    }
  }, [body, isFocused, onChange]);

  // 다크모드 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => setIsDark(mediaQuery.matches);

    handleChange(); // 초기값 설정
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 코드미러 에디터 초기화
  useEffect(() => {
    if (!ref.current) return;

    const themeExtension = isDark ? vscodeDark : vscodeLight;

    const startState = EditorState.create({
      doc: initialValueRef.current,
      extensions: [
        basicSetup,
        markdown(),
        themeExtension,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const doc = update.state.doc.toString();
            setBody(doc);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: ref.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [isDark]); // <- isDark 바뀔 때마다 재생성

  // 외부에서 value 강제로 바꿀 때
  useEffect(() => {
    if (isFocused) return;
    const view = viewRef.current;
    if (!view) return;

    const current = view.state.doc.toString();
    if (value !== current) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value, isFocused]);

  return <div className="h-full w-full" ref={ref} />;
}
