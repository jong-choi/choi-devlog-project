import { createStore } from "zustand";
import type { ChatMessage, RouteType } from "@/types/chat";

export interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  statusMessage: string;
  setStatusMessage: (message: string) => void;
  clearStatusMessage: () => void;

  sessionId: string;
  setSessionId: (id: string) => void;

  routeType: RouteType | null;
  setRouteType: (type: RouteType | null) => void;
}

export const createChatStore = (initialState?: Partial<ChatState>) =>
  createStore<ChatState>((set) => ({
    messages: [],
    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, message],
      })),
    updateLastMessage: (content) =>
      set((state) => {
        if (state.messages.length === 0) return {};

        const lastMessage = state.messages[state.messages.length - 1];
        if (!lastMessage || lastMessage.role !== "assistant") return {};

        let newContent = (lastMessage.content ?? "") + content;

        // 메시지가 ", " 또는 ". "로 시작하면 제거
        if (lastMessage.content.length <= 5) {
          newContent = newContent.replace(/^(\.|,| )/, "");
        }

        if (lastMessage.content === newContent) return {};

        const updatedMessages = [...state.messages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: newContent,
        };

        return { messages: updatedMessages };
      }),
    clearMessages: () => set({ messages: [] }),

    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),

    statusMessage: "",
    setStatusMessage: (message) => set({ statusMessage: message }),
    clearStatusMessage: () => set({ statusMessage: "" }),

    sessionId: "",
    setSessionId: (id) => set({ sessionId: id }),

    routeType: null,
    setRouteType: (type) => set({ routeType: type }),

    ...initialState,
  }));
