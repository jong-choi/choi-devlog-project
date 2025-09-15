"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { GlassButton } from "@ui/glass-button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";
import { useRouteLoadingStore } from "@/providers/route-loading-provider";

export default function SearchInput({
  className,
  withButton = true,
  onSidebar = false,
}: {
  className?: string;
  withButton?: boolean;
  onSidebar?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const initialSearch = params.get("keyword") || "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [disabled, setDisabled] = useState<boolean>(true);

  const { start, stop } = useRouteLoadingStore(
    useShallow((state) => ({
      start: state.start,
      stop: state.stop,
    })),
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = initialSearch;
      stop();
    }
  }, [initialSearch, stop]);

  const handleSearch = () => {
    if (disabled) return;
    const inputValue = inputRef.current?.value;
    if (!inputValue) return router.push("/posts");

    const newParams = new URLSearchParams(params);
    if (inputValue) newParams.set("keyword", inputValue);
    else newParams.delete("keyword");

    start();
    router.push(`/posts/search?keyword=${inputValue}`, {
      scroll: false,
    });
  };

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <form
      onSubmit={submitHandler}
      className={cn(
        "flex items-center max-w-md gap-2 rounded-xl bg-glass-bg px-3 py-2 backdrop-blur-lg shadow-glass",
        className,
      )}
    >
      <Search
        className={cn(
          "h-5 w-5 text-color-base",
          onSidebar && "h-4 w-4 text-color-muted",
        )}
      />
      <Input
        id="search"
        ref={inputRef}
        className={cn(
          "flex-1 bg-transparent border-none text-color-base placeholder:text-glass-text-secondary shadow-none",
          onSidebar && "focus-visible:ring-0",
        )}
        placeholder="검색어 입력"
        onChange={(e) => {
          setDisabled(!e.target.value || e.target.value === initialSearch);
        }}
      />
      <GlassButton
        type="submit"
        variant="primary"
        className={cn("whitespace-nowrap", !withButton && "hidden")}
        disabled={disabled}
      >
        검색
      </GlassButton>
    </form>
  );
}
