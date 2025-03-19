// app/auth/login/page.tsx (로그인 페이지)
"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { checkPin, signOutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const LOGOUT_BUTTON_TEXT = "Logout";
  const LOGOUT_CONFIRM_TEXT = "진짜?";
  const MAX_TRIAL_LIMIT = 5;
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState(LOGOUT_BUTTON_TEXT);
  const [pinNumber, setPinNumber] = useState<string>("");
  const [message, setMessage] = useState<string>("PIN번호를 입력하여 로그인");
  const [count, setCount] = useState(0);
  const router = useRouter();

  const handleLogin = useCallback(
    async (pin: string) => {
      if (count > MAX_TRIAL_LIMIT) {
        setMessage("PIN번호가 일치하지 않는다고");
        setPinNumber("");
        setCount((prev) => prev + 1);
        if (count > MAX_TRIAL_LIMIT * 2) {
          router.push("/");
        }
        return;
      }
      setLoading(true);
      const result = await checkPin(pin);
      if (result.status !== "OK") {
        setLoading(false);
        setMessage("PIN번호가 일치하지 않습니다");
        setPinNumber("");
        setCount((prev) => prev + 1);
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google", // Google OAuth 로그인
        options: { redirectTo: `${window.location.origin}/callback` },
      });
      if (error) {
        router.push(
          `/auth-code-error?message=${encodeURIComponent(error.message)}`
        );
        setLoading(false);
      }
      setMessage("로그인 완료");
    },
    [count, router]
  );

  useEffect(() => {
    if (pinNumber.length >= 4) {
      handleLogin(pinNumber);
    }
  }, [handleLogin, pinNumber]); // pin의 길이가 4가 될 때 실행

  // PIN 입력 함수
  const handleButtonClick = (num: string) => {
    if (pinNumber.length < 4) {
      setPinNumber((prev) => prev + num);
    }
  };

  // PIN 삭제 함수 (백스페이스)
  const handleDelete = () => {
    setPinNumber((prev) => prev.slice(0, -1));
  };

  const handleLogout = () => {
    setLoading(true);
    signOutAction();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">PIN 번호</h1>
      <div className="text-sm transition-all">
        {loading ? "로그인 중..." : message}
      </div>
      <input
        id="pin"
        type="password"
        maxLength={4}
        pattern="[0-9]*"
        inputMode="decimal"
        className="w-40 h-14 text-center text-2xl font-bold tracking-widest text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        placeholder="----"
        value={pinNumber}
        onChange={(e) => {
          const onlyNums = e.target.value.replace(/\D/g, ""); // 숫자가 아닌 값 제거
          setPinNumber(onlyNums); // 상태에 숫자만 저장
        }}
      />
      <div className="hidden lg:grid grid-cols-3 gap-2 pt-5 ">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, buttonText, 0, "del"].map(
          (item, index) => (
            <button
              key={index}
              className={cn(
                "w-16 h-16 text-xl font-bold rounded-lg text-zinc-400 ",
                "bg-zinc-100 hover:bg-zinc-200", // 기본 스타일
                item === "del" && "bg-rose-200 hover:bg-rose-100",
                item === LOGOUT_BUTTON_TEXT && "text-sm",
                item === LOGOUT_CONFIRM_TEXT && "text-sm hover:bg-emerald-100"
              )}
              onClick={() => {
                if (item === "del") handleDelete();
                if (item === LOGOUT_BUTTON_TEXT)
                  setButtonText(LOGOUT_CONFIRM_TEXT);
                if (item === LOGOUT_CONFIRM_TEXT) handleLogout();
                else if (typeof item === "number")
                  handleButtonClick(item.toString());
              }}
            >
              {item}
            </button>
          )
        )}
      </div>
    </div>
  );
}
