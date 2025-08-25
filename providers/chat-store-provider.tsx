"use client";

import {
  createChatStore,
  ChatState,
} from "@/hooks/zustand/use-chat-store";
import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";

export type ChatStoreApi = ReturnType<typeof createChatStore>;

const ChatStoreContext = createContext<ChatStoreApi | undefined>(undefined);

interface ChatStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<ChatState>;
}

export const ChatStoreProvider = ({
  children,
  initialState,
}: ChatStoreProviderProps) => {
  const storeRef = useRef<ChatStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createChatStore(initialState);
  }

  return (
    <ChatStoreContext.Provider value={storeRef.current}>
      {children}
    </ChatStoreContext.Provider>
  );
};

export const useChatStore = <T,>(selector: (store: ChatState) => T): T => {
  const chatStoreContext = useContext(ChatStoreContext);

  if (!chatStoreContext) {
    throw new Error("useChatStore must be used within ChatStoreProvider");
  }

  return useStore(chatStoreContext, selector);
};