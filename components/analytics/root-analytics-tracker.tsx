"use client";

import { useEffect, useRef } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";

export function RootAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const lastSentKeyRef = useRef<string>("");
  const search = searchParams.toString();
  const paramsText = JSON.stringify(routeParams ?? {});
  const dedupeKey = `${pathname ?? ""}|${search}|${paramsText}`;

  useEffect(() => {
    if (!pathname || lastSentKeyRef.current === dedupeKey) return;
    lastSentKeyRef.current = dedupeKey;

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        search,
        params: paramsText,
      }),
      keepalive: true, // abort 없이 진행 
    }).catch(() => {
      // NO-OP: 서버 에러 읽지 않고 진행
    });
  }, [dedupeKey, paramsText, pathname, search]);

  return null;
}
