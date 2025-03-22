"use client";

import Link from "next/link";

export function TopBar() {
  return (
    <nav className="h-14 hidden md:flex sticky top-0 left-0 w-full bg-white/90 dark:bg-[#1f1f1f]/90 backdrop-blur border-b border-border z-10  items-center px-6 justify-between">
      <Logo />
    </nav>
  );
}

export function Logo() {
  return (
    <Link href="/post">
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        scribbly<span className="text-indigo-500">.</span>
      </h1>
    </Link>
  );
}
