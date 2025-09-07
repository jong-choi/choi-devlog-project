import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { EditorState } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import { EditorView } from "@milkdown/kit/prose/view";
import { $prose } from "@milkdown/kit/utils";

export interface HighlightState {
  decorations: DecorationSet;
  highlightRange: { from: number; to: number } | null;
}

export const highlightPluginKey = new PluginKey<HighlightState>("highlight");

export interface HighlightPluginOptions {
  className?: string;
  enabled?: boolean;
}

function createProseMirrorHighlightPlugin(
  options: HighlightPluginOptions = {},
) {
  const { className = "milkdown-selection-highlight", enabled = true } =
    options;

  return new Plugin<HighlightState>({
    key: highlightPluginKey,

    state: {
      init() {
        return {
          decorations: DecorationSet.empty,
          highlightRange: null,
        };
      },

      apply(tr, oldState) {
        let { decorations, highlightRange } = oldState;

        if (tr.docChanged || tr.selectionSet) {
          decorations = decorations.map(tr.mapping, tr.doc);
        }

        const meta = tr.getMeta(highlightPluginKey);
        if (meta) {
          if (meta.type === "setHighlight") {
            highlightRange = meta.range;
            if (highlightRange) {
              const decoration = Decoration.inline(
                highlightRange.from,
                highlightRange.to,
                { class: className },
              );
              decorations = DecorationSet.create(tr.doc, [decoration]);
            } else {
              decorations = DecorationSet.empty;
            }
          } else if (meta.type === "clearHighlight") {
            highlightRange = null;
            decorations = DecorationSet.empty;
          }
        }

        return { decorations, highlightRange };
      },
    },

    props: {
      decorations(state) {
        if (!enabled) return null;
        return this.getState(state)?.decorations || DecorationSet.empty;
      },
    },
  });
}

export const highlightPlugin = $prose(() =>
  createProseMirrorHighlightPlugin({
    className: "milkdown-selection-highlight",
    enabled: true,
  }),
);

export function setHighlight(view: EditorView, from: number, to: number) {
  const tr = view.state.tr.setMeta(highlightPluginKey, {
    type: "setHighlight",
    range: { from, to },
  });
  view.dispatch(tr);
}

export function clearHighlight(view: EditorView) {
  const tr = view.state.tr.setMeta(highlightPluginKey, {
    type: "clearHighlight",
  });
  view.dispatch(tr);
}

export function getHighlightRange(
  state: EditorState,
): { from: number; to: number } | null {
  const pluginState = highlightPluginKey.getState(state);
  return pluginState?.highlightRange || null;
}
