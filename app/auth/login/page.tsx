// app/auth/login/page.tsx (로그인 페이지)
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google", // Google OAuth 로그인
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      router.push(
        `/auth/auth-code-error?message=${encodeURIComponent(error.message)}`
      );
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">로그인</h1>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "로그인 중..." : "Google 로그인"}
      </button>
    </div>
  );
}
