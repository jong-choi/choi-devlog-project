"use client";

import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { MouseEventHandler } from "react";
import { useShallow } from "zustand/react/shallow";

export function TopBar({ topBarHeightRem }: { topBarHeightRem: string }) {
  const { leftOpen, setLeftOpen, rightOpen, setRightOpen } = useLayoutStore(
    useShallow((state) => state)
  );

  return (
    <nav
      className={cn(
        "hidden md:flex sticky top-0 left-0 w-full bg-white/90 dark:bg-[#1f1f1f]/90 backdrop-blur border-b border-border z-10  items-center px-6 justify-between",
        `h-[${topBarHeightRem}]`
      )}
    >
      <Logo />
      <div className="flex gap-2 items-center">
        <ToggleButton
          open={leftOpen}
          onClick={() => setLeftOpen(!leftOpen)}
          label="카테고리"
        />
        <ToggleButton
          open={rightOpen}
          onClick={() => setRightOpen(!rightOpen)}
          label="탐색"
        />
      </div>
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

function ToggleButton({
  open,
  onClick,
  label,
}: {
  open: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-100 px-3 py-1 rounded text-sm"
    >
      {open ? `${label} 숨기기` : `${label} 보이기`}
    </button>
  );
}
