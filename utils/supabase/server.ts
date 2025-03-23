"use server";

import { Database } from "@/types/supabase";
import { createServerClient } from "@supabase/ssr";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";

/* 수정 전
export const createClient = async () => {
  const cookieStore = await cookies();
*/
export const createClient = async (
  initialCookieStore?: ReadonlyRequestCookies,
  useServiceRole?: boolean
) => {
  const cookieStore = initialCookieStore || (await cookies());

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    useServiceRole
      ? process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role Key 사용 (업로드 시)
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // 기본적으로 Anon Key 사용
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
