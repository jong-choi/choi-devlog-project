"use client";

import { useEffect } from "react";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function SidebarCloseOnMount() {
  const setMobileClosed = useLayoutStore((s) => s.setMobileClosed);
  const setSidebarLeftCollapsed = useLayoutStore(
    (s) => s.setSidebarLeftCollapsed,
  );
  const setRightPanelOpen = useLayoutStore((state) => state.setRightPanelOpen);

  useEffect(() => {
    const innerWidth = window.innerWidth;
    if (innerWidth >= 768 && innerWidth <= 1023) {
      setSidebarLeftCollapsed(true);
      setRightPanelOpen(false);
    }
    if (innerWidth <= 768) {
      setMobileClosed();
    }
  }, [setMobileClosed, setRightPanelOpen, setSidebarLeftCollapsed]);

  return null;
}
