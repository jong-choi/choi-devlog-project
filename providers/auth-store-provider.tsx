"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/providers/auth-provider";
import { useShallow } from "zustand/react/shallow";

const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const { setUser } = useAuthStore(
    useShallow((state) => ({
      setUser: state.setUser,
    }))
  );

  useEffect(() => {
    let unsubscribe: () => void;

    const initAuth = async () => {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      // 1. 세션 불러오기
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null, session);

      // 2. 인증 상태 변화 감지
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null, session);
        }
      );

      unsubscribe = () => {
        authListener.subscription.unsubscribe();
      };
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
};

export default AuthProvider;
