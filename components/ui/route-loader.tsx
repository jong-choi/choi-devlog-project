"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouteLoadingStore } from "@/providers/route-loading-provider";
import { Spinner } from "@ui/spinner";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { UrlObject } from "url";

type Props = React.ComponentProps<typeof Link>;

export function LinkLoader({ href, onClick, ...rest }: Props) {
  const decodedPathname = decodeURIComponent(usePathname());
  const { start } = useRouteLoadingStore(
    useShallow((state) => ({
      start: state.start,
    }))
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
    }))
  );

  useEffect(() => {
    stop();
  }, [pathname, stop]);

  if (state !== "loading") return null;

  return (
    <div className="fixed inset-0 z-[100] md:z-30 flex items-center justify-center bg-glass-bg-20 backdrop-blur-sm">
      <div className="text-muted-foreground">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
