"use client";

import { cn } from "@/lib/utils";
import { GlassButton } from "@ui/glass-button";
import { Input } from "@ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const initialSearch = params.get("search") || "";
  const [input, setInput] = useState(initialSearch);

  useEffect(() => {
    setInput(initialSearch);
  }, [initialSearch]);

  const handleSearch = () => {
    const newParams = new URLSearchParams(params);
    if (input) newParams.set("search", input);
    else newParams.delete("search");

    router.push(`/posts/?${newParams.toString()}`, { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center max-w-md gap-2 rounded-xl bg-glass-bg px-3 py-2 backdrop-blur-lg shadow-glass",
        className
      )}
    >
      <Search
        onClick={handleSearch}
        className={cn(
          "h-5 w-5 text-color-base",
          onSidebar && "h-4 w-4 text-color-muted"
        )}
      />
      <Input
        id="search"
        className={cn(
          "flex-1 bg-transparent border-none text-color-base placeholder:text-glass-text-secondary shadow-none",
          onSidebar && "focus-visible:ring-0"
        )}
        placeholder="검색어 입력"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <GlassButton
        variant="primary"
        onClick={handleSearch}
        className={cn("whitespace-nowrap", !withButton && "hidden")}
      >
        검색
      </GlassButton>
    </div>
  );
}
