"use client";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/providers/auth-provider";
import { useShallow } from "zustand/react/shallow";
const supabase = createClient();

const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const { setUser } = useAuthStore(
    useShallow((state) => ({
      setUser: state.setUser,
    }))
  );

  useEffect(() => {
    // 초기 세션 확인
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null, session);
    };

    getSession();

    // 인증 상태 변화 감지
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null, session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
};

export default AuthProvider;
