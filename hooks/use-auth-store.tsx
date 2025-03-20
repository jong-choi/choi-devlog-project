import { createStore } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface AuthState {
  user: User | null;
  session: Session | null;
  isValid: boolean;
  loading: boolean;
  setUser: (user: User | null, session: Session | null) => void;
  logout: () => Promise<void>;
}

export const createAuthStore = (initialState?: Partial<AuthState>) =>
  createStore<AuthState>((set) => ({
    user: null,
    session: null,
    isValid: false,
    loading: true, // 초기 로딩 상태
    setUser: (user, session) =>
      set({
        user,
        session,
        isValid:
          user?.email_confirmed_at ===
          process.env.NEXT_PUBLIC_VALID_EMAIL_CONFIRMED_AT,
        loading: false,
      }),
    logout: async () => {
      await supabase.auth.signOut();
      set({ user: null, session: null });
    },
    ...initialState, // 초기값 덮어쓰기
  }));
