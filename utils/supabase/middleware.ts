"use server";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export const updateSession = async (
  request: NextRequest,
  allowedOrigins: string[],
) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    // Admin 경로 보호 강화
    const adminPaths = ["/admin"];
    const isAdminPath = adminPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );

    if (isAdminPath) {
      // 1. 기본 인증 확인
      if (user.error || !user.data.user) {
        console.log(
          `[ADMIN_ACCESS_DENIED] Unauthenticated access attempt to ${request.nextUrl.pathname}`,
        );
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // 2. Admin 접근 로깅
      const userEmail = user.data.user.email;
      const userAgent = request.headers.get("user-agent") || "Unknown";
      const timestamp = new Date().toISOString();

      console.log(
        `[ADMIN_ACCESS] ${timestamp} - Email: ${userEmail}, Path: ${request.nextUrl.pathname}, User-Agent: ${userAgent}`,
      );

      // 3. 추가 권한 검증 (환경변수 기반, 선택사항)
      // ADMIN_EMAILS 환경변수가 설정된 경우에만 특정 이메일만 허용
      if (process.env.ADMIN_EMAILS) {
        const validAdminEmails = process.env.ADMIN_EMAILS.split(",").map(
          (email) => email.trim(),
        );
        if (!userEmail || !validAdminEmails.includes(userEmail)) {
          console.log(
            `[ADMIN_ACCESS_DENIED] Unauthorized user ${userEmail} attempted to access admin area`,
          );
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }

    // 기존 제한된 경로 처리 (하위 호환성 유지)
    const restrictedPaths = ["/admin"];
    const isRestricted = restrictedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );

    if (isRestricted && user.error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.nextUrl.pathname === "/login" && !user.error) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const requestOrigin = request.headers.get("origin");

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      response.headers.set("Access-Control-Allow-Origin", requestOrigin);
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    console.error("[MIDDLEWARE_ERROR] Supabase client creation failed:", e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
