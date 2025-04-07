"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { notFound } from "next/navigation";

interface PostNotFoundProps {
  urlSlug: string;
}

export default function PostNotFound({ urlSlug }: PostNotFoundProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.endsWith("/private")) {
      router.replace(`/post/${urlSlug}/private`);
    } else {
      notFound();
    }
  }, [urlSlug, pathname, router]);

  return null;
}
