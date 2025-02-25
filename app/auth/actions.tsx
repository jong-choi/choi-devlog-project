"use server"; // Next.js의 Server Actions를 사용하도록 지정

import { encodedRedirect } from "@/utils/encodedRedirect"; // 메시지를 포함한 리디렉션 함수
import { createClient } from "@/utils/supabase/server"; // Supabase 클라이언트 생성 함수
import { headers } from "next/headers"; // 요청 헤더 가져오기
import { redirect } from "next/navigation"; // Next.js 리디렉션 함수

// ✅ 회원가입 처리 (Sign Up)
export const signUpAction = async (formData: FormData) => {
  // 🔹 폼 데이터에서 이메일과 비밀번호 추출
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient(); // Supabase 클라이언트 생성
  const origin = (await headers()).get("origin"); // 현재 요청의 Origin (도메인) 가져오기

  // 🔹 이메일 또는 비밀번호가 없으면 에러 메시지를 포함하여 리디렉션
  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  // 🔹 Supabase를 사용해 회원가입 요청
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`, // 이메일 확인 후 이동할 URL 설정
    },
  });

  // 🔹 에러 발생 시 에러 메시지를 포함하여 리디렉션
  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // 🔹 회원가입 성공 시 성공 메시지를 포함하여 리디렉션
  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link."
  );
};

// ✅ 로그인 처리 (Sign In)
export const signInAction = async (formData: FormData) => {
  // 🔹 폼 데이터에서 이메일과 비밀번호 추출
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient(); // Supabase 클라이언트 생성

  // 🔹 Supabase를 사용해 로그인 요청
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 🔹 에러 발생 시 에러 메시지를 포함하여 리디렉션
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // 🔹 로그인 성공 시 보호된 페이지로 이동
  return redirect("/protected");
};

// ✅ 비밀번호 재설정 요청 (Forgot Password)
export const forgotPasswordAction = async (formData: FormData) => {
  // 🔹 폼 데이터에서 이메일 추출
  const email = formData.get("email")?.toString();
  const supabase = await createClient(); // Supabase 클라이언트 생성
  const origin = (await headers()).get("origin"); // 현재 요청의 Origin (도메인) 가져오기
  const callbackUrl = formData.get("callbackUrl")?.toString(); // 콜백 URL이 있는 경우 가져오기

  // 🔹 이메일이 없으면 에러 메시지를 포함하여 리디렉션
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  // 🔹 Supabase를 사용해 비밀번호 재설정 이메일 전송 요청
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`, // 비밀번호 재설정 후 이동할 URL 설정
  });

  // 🔹 에러 발생 시 에러 메시지를 포함하여 리디렉션
  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  // 🔹 콜백 URL이 있으면 해당 URL로 리디렉션
  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  // 🔹 비밀번호 재설정 이메일이 전송되었음을 알리는 메시지 포함하여 리디렉션
  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

// ✅ 비밀번호 변경 처리 (Reset Password)
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient(); // Supabase 클라이언트 생성

  // 🔹 폼 데이터에서 새 비밀번호와 확인용 비밀번호 추출
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // 🔹 비밀번호 또는 확인용 비밀번호가 없으면 에러 메시지를 포함하여 리디렉션
  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  // 🔹 비밀번호와 확인용 비밀번호가 일치하지 않으면 에러 메시지를 포함하여 리디렉션
  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  // 🔹 Supabase를 사용해 비밀번호 변경 요청
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  // 🔹 에러 발생 시 에러 메시지를 포함하여 리디렉션
  if (error) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  // 🔹 비밀번호 변경 성공 시 성공 메시지를 포함하여 리디렉션
  return encodedRedirect(
    "success",
    "/protected/reset-password",
    "Password updated"
  );
};

// ✅ 로그아웃 처리 (Sign Out)
export const signOutAction = async () => {
  const supabase = await createClient(); // Supabase 클라이언트 생성

  // 🔹 Supabase를 사용해 로그아웃 요청
  await supabase.auth.signOut();

  // 🔹 로그아웃 후 로그인 페이지로 이동
  return redirect("/sign-in");
};
