import { createStore } from "zustand";
import { Ctx } from "@milkdown/kit/ctx";

export interface AiInlineState {
  // UI 상태
  isOpen: boolean;
  isLoading: boolean;
  position: { x: number; y: number };
  
  // Milkdown 컨텍스트
  ctx: Ctx | null;
  
  // 하이라이트 관련
  highlightEnabled: boolean;
  selectedRange: { from: number; to: number } | null;
  
  // 액션들
  openDock: (x: number, y: number, ctx: Ctx) => void;
  closeDock: () => void;
  setLoading: (loading: boolean) => void;
  setHighlight: (enabled: boolean, range?: { from: number; to: number }) => void;
  resetState: () => void;
}

export const createAiInlineStore = (initialState?: Partial<AiInlineState>) =>
  createStore<AiInlineState>((set) => ({
    // 초기 상태
    isOpen: false,
    isLoading: false,
    position: { x: 0, y: 0 },
    ctx: null,
    highlightEnabled: false,
    selectedRange: null,
    
    // 독 열기
    openDock: (x, y, ctx) =>
      set({
        isOpen: true,
        position: { x, y },
        ctx,
        isLoading: false,
      }),
    
    // 독 닫기
    closeDock: () =>
      set({
        isOpen: false,
        isLoading: false,
        highlightEnabled: false,
        selectedRange: null,
      }),
    
    // 로딩 상태 설정
    setLoading: (loading) =>
      set({ isLoading: loading }),
    
    // 하이라이트 설정
    setHighlight: (enabled, range) =>
      set({
        highlightEnabled: enabled,
        selectedRange: enabled ? range || null : null,
      }),
    
    // 전체 상태 리셋
    resetState: () =>
      set({
        isOpen: false,
        isLoading: false,
        position: { x: 0, y: 0 },
        ctx: null,
        highlightEnabled: false,
        selectedRange: null,
      }),
    
    ...initialState,
  }));