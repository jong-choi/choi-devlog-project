"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { GlassButton } from "@ui/glass-button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

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
  const params = useParams();
  const initialSearch =
    typeof params.keyword === "string"
      ? decodeURIComponent(params.keyword)
      : "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = initialSearch;
    }
  }, [initialSearch]);

  const handleSearch = () => {
    if (disabled) return;
    const inputValue = inputRef.current?.value;
    if (!inputValue) return router.push("/post");

    setDisabled(true);
    router.push(`/search/${inputValue}`, {
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
