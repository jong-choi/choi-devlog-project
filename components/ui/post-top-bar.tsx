"use client";

import { LinkLoader } from "@ui/route-loader";

export function TopBar() {
  return (
    <nav className="h-14 flex flex-shrink-0 md:sticky top-0 left-0 w-full bg-glass-bg backdrop-blur-3xl border-b border-border z-10 justify-center px-6">
      <div className="w-full h-full lg:max-w-screen-xl flex items-center ">
        <Logo />
      </div>
    </nav>
  );
}

export function LogoText() {
  return (
    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
      scribbly<span className="text-indigo-500">.</span>
    </h1>
  );
}

export function Logo() {
  return (
    <LinkLoader href="/">
      <LogoText />
    </LinkLoader>
  );
}
