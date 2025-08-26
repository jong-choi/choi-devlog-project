"use client";

import { useEffect } from "react";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function MobileCloseOnMount() {
  const setMobileClosed = useLayoutStore((s) => s.setMobileClosed);
  useEffect(() => {
    setMobileClosed();
  }, [setMobileClosed]);
  return null;
}
