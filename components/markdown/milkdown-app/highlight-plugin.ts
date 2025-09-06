import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import { EditorView } from "@milkdown/kit/prose/view";
import { EditorState } from "@milkdown/kit/prose/state";
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

// ProseMirror 플러그인 생성 함수
function createProseMirrorHighlightPlugin(options: HighlightPluginOptions = {}) {
  const { className = "milkdown-selection-highlight", enabled = false } = options;

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
        
        // 트랜잭션이 선택을 변경했거나 문서를 수정했다면 데코레이션을 업데이트
        if (tr.docChanged || tr.selectionSet) {
          decorations = decorations.map(tr.mapping, tr.doc);
        }
        
        // 메타데이터를 통해 하이라이트 상태 업데이트
        const meta = tr.getMeta(highlightPluginKey);
        if (meta) {
          if (meta.type === "setHighlight") {
            highlightRange = meta.range;
            if (highlightRange) {
              const decoration = Decoration.inline(
                highlightRange.from,
                highlightRange.to,
                { class: className }
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

// Milkdown 플러그인으로 래핑
export const highlightPlugin = $prose(() => 
  createProseMirrorHighlightPlugin({ 
    className: "milkdown-selection-highlight", 
    enabled: true 
  })
);

// 하이라이트 설정 헬퍼 함수
export function setHighlight(view: EditorView, from: number, to: number) {
  const tr = view.state.tr.setMeta(highlightPluginKey, {
    type: "setHighlight",
    range: { from, to },
  });
  view.dispatch(tr);
}

// 하이라이트 제거 헬퍼 함수
export function clearHighlight(view: EditorView) {
  const tr = view.state.tr.setMeta(highlightPluginKey, {
    type: "clearHighlight",
  });
  view.dispatch(tr);
}

// 현재 하이라이트 범위 가져오기
export function getHighlightRange(state: EditorState): { from: number; to: number } | null {
  const pluginState = highlightPluginKey.getState(state);
  return pluginState?.highlightRange || null;
}