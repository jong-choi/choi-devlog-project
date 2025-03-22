"use client";

import { cn } from "@/lib/utils";

export function TopBar({ topBarHeightRem }: { topBarHeightRem: string }) {
  return (
    <nav
      className={cn(
        "hidden md:flex sticky top-0 left-0 w-full bg-white/90 dark:bg-[#1f1f1f]/90 backdrop-blur border-b border-border z-10  items-center px-6 justify-between",
        `h-[${topBarHeightRem}]`
      )}
    >
      <Logo />
    </nav>
  );
}

export function Logo() {
  return (
    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
      scribbly<span className="text-indigo-500">.</span>
    </h1>
  );
}
