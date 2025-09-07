"use client";

import { useEffect } from "react";
import type { Crepe } from "@milkdown/crepe";
import type { Ctx } from "@milkdown/ctx";
import { editorViewCtx } from "@milkdown/kit/core";
import { setHighlight } from "@/lib/milkdown/plugins/highlight-plugin";

interface UseHighlightSyncOptions {
  editorRef: React.RefObject<Crepe | null>;
  enabled: boolean;
  isDockOpen: boolean;
  range: { from: number; to: number } | null;
}

export function useHighlightSync({
  editorRef,
  enabled,
  isDockOpen,
  range,
}: UseHighlightSyncOptions) {
  useEffect(() => {
    if (!enabled || !isDockOpen || !range) return;
    const editor = editorRef.current?.editor;
    if (!editor) return;
    editor.action((ctx: Ctx) => {
      const view = ctx.get(editorViewCtx);
      setHighlight(view, range.from, range.to);
    });
  }, [enabled, isDockOpen, range, editorRef]);
}
