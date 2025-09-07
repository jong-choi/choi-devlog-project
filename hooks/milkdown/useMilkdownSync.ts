"use client";

import { useEffect } from "react";
import type { Crepe } from "@milkdown/crepe";
import { editorViewCtx, parserCtx } from "@milkdown/kit/core";
import { Slice } from "@milkdown/kit/prose/model";
import { Selection } from "@milkdown/kit/prose/state";
import { getMarkdown } from "@milkdown/kit/utils";

interface UseMilkdownSyncOptions {
  editorRef: React.RefObject<Crepe | null>;
  isFocused: boolean;
  markdown: string;
  onBodyChange: (val: string) => void;
}

export function useMilkdownSync({
  editorRef,
  isFocused,
  markdown,
  onBodyChange,
}: UseMilkdownSyncOptions) {
  // 포커스 상태에서 상향 동기화 (에디터 -> 상위)
  useEffect(() => {
    if (!isFocused) return;
    const editor = editorRef.current?.editor;
    if (!editor) return;
    try {
      const current = editor.action(getMarkdown());
      if (typeof current === "string") onBodyChange(current);
    } catch (_) {}
  }, [isFocused, editorRef, onBodyChange]);

  // 외부 markdown 변경 시 하향 동기화 (상위 -> 에디터)
  useEffect(() => {
    if (isFocused) return;
    const editor = editorRef.current?.editor;
    if (!editor) return;
    try {
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const parser = ctx.get(parserCtx);
        const doc = parser(markdown);
        if (!doc) return;
        const state = view.state;
        const { from } = state.selection;
        let tr = state.tr.replace(
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
    } catch (_) {}
  }, [markdown, isFocused, editorRef]);
}
