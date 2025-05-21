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

export function LogoBigText() {
  return (
    <div className="flex flex-col justify-center">
      <p className="text-xs font-extralight text-gray-900 dark:text-white -my-1">
        THE DEVLOG
      </p>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        scribbly<span className="text-indigo-500">.</span>
      </h1>
    </div>
  );
}

export function LogoText() {
  return (
    <div className="flex flex-col justify-center">
      <p className="text-[8px] font-extralight text-gray-900 dark:text-white -my-1">
        THE DEVLOG
      </p>
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        scribbly<span className="text-indigo-500">.</span>
      </h1>
    </div>
  );
}

export function Logo() {
  return (
    <LinkLoader href="/">
      <LogoText />
    </LinkLoader>
  );
}
