import { createStore } from "zustand";

type LoadingState = "idle" | "pending" | "loading";

export interface RouteLoadingState {
  state: LoadingState;
  start: () => void;
  stop: () => void;
}

export const createRouteLoadingStore = (
  initialState?: Partial<RouteLoadingState>
) =>
  createStore<RouteLoadingState>((set, get) => {
    let timeout: NodeJS.Timeout; // timeout id를 저장하는 '비공개 상태'
    return {
      state: "idle",
      start: () => {
        clearTimeout(timeout);
        set({ state: "pending" });
        timeout = setTimeout(() => {
          if (get().state === "pending") {
            set({ state: "loading" });
          }
        }, 200);
      },
      stop: () => {
        clearTimeout(timeout);
        set({ state: "idle" });
      },
      ...initialState,
    };
  });
