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

  routeType: RouteType;
  setRouteType: (type: RouteType) => void;
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

        const newContent = (lastMessage.content ?? "") + content;
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

    routeType: "chat",
    setRouteType: (type) => set({ routeType: type }),

    ...initialState,
  }));
