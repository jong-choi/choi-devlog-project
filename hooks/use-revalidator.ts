"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useRevalidator() {
  const router = useRouter();
  const revalidateCacheTags = async (cacheTags: string[]) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: cacheTags,
        }),
      });
      router.refresh();
    } catch (error) {
      console.error("캐시 재검증 중 오류:", error);
      toast.error("캐시 재검증 중 오류가 발생했습니다.");
    }
  };

  return revalidateCacheTags;
}
