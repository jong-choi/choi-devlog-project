import { createStore } from "zustand";
import type { ChatMessage, RouteType } from "@/types/chat";

export interface ChatState {
  // 메시지 상태
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  
  // 로딩/세션 상태
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  sessionId: string;
  setSessionId: (id: string) => void;
  
  // 라우트 타입
  routeType: RouteType;
  setRouteType: (type: RouteType) => void;
}

export const createChatStore = (initialState?: Partial<ChatState>) =>
  createStore<ChatState>((set) => ({
    // 메시지 상태
    messages: [],
    addMessage: (message) => set((state) => ({ 
      messages: [...state.messages, message] 
    })),
    updateLastMessage: (content) => set((state) => {
      if (state.messages.length === 0) return {};
      
      const lastMessage = state.messages[state.messages.length - 1];
      if (!lastMessage || lastMessage.role !== "assistant") return {};
      
      const newContent = (lastMessage.content ?? "") + content;
      // 내용이 같으면 업데이트하지 않음
      if (lastMessage.content === newContent) return {};
      
      const updatedMessages = [...state.messages];
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        content: newContent,
      };
      
      return { messages: updatedMessages };
    }),
    clearMessages: () => set({ messages: [] }),
    
    // 로딩/세션 상태
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    
    sessionId: "",
    setSessionId: (id) => set({ sessionId: id }),
    
    // 라우트 타입
    routeType: "chat",
    setRouteType: (type) => set({ routeType: type }),
    
    ...initialState, // 초기값 덮어쓰기
  }));

