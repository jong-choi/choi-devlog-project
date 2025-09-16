"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UrlObject } from "url";
import { useShallow } from "zustand/react/shallow";
import { Spinner } from "@ui/spinner";
import { useRouteLoadingStore } from "@/providers/route-loading-provider";

type Props = React.ComponentProps<typeof Link>;

export function LinkLoader({ href, onClick, ...rest }: Props) {
  const decodedPathname = decodeURIComponent(usePathname());
  const { start } = useRouteLoadingStore(
    useShallow((state) => ({
      start: state.start,
    })),
  );

  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (
          (typeof href === "object" &&
            (href as UrlObject).pathname !== decodedPathname) ||
          (typeof href === "string" && href !== decodedPathname)
        ) {
          start();
        }
      }}
    />
  );
}

export function RouteLoader() {
  const pathname = usePathname();
  const { stop, state } = useRouteLoadingStore(
    useShallow((state) => ({
      stop: state.stop,
      state: state.state,
    })),
  );

  useEffect(() => {
    stop();
  }, [pathname, stop]);

  if (state !== "loading") return null;

  return (
    <div className="fixed inset-0 z-50 hidden lg:flex items-center justify-center bg-glass-bg-20 backdrop-blur-sm">
      <div className="text-muted-foreground">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
