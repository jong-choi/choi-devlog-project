import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  // ✅ userId가 없으면 로그인 페이지로, 있으면 해당 경로로 리다이렉트
  if (!userId) {
    redirect("/auth/login");
  } else {
    redirect(`/example/${userId}`);
  }
}
