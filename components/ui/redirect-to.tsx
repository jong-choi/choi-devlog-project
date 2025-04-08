"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RedirectToProps {
  to: string;
  replace?: boolean; // 기본값: true
}

export default function RedirectTo({ to, replace = true }: RedirectToProps) {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);

  return null;
}
