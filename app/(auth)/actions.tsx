"use server"; // Next.js의 Server Actions를 사용하도록 지정

import { createClient } from "@/utils/supabase/server"; // Supabase 클라이언트 생성 함수
import { redirect } from "next/navigation"; // Next.js 리디렉션 함수

export const checkPin = async (pin: string) => {
  if (pin === process.env.LOGIN_PIN_NUMBER) {
    return { status: "OK" };
  } else {
    return { status: "FAIL" };
  }
};

// ✅ 로그아웃 처리 (Sign Out)
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};
