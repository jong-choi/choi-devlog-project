"use client";

import { GlassButton } from "@ui/glass-button";
import { Input } from "@ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchInput() {
  const router = useRouter();
  const params = useSearchParams();
  const initialSearch = params.get("search") || "";
  const [input, setInput] = useState(initialSearch);

  const handleSearch = () => {
    const newParams = new URLSearchParams(params);
    if (input) newParams.set("search", input);
    else newParams.delete("search");

    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center max-w-md gap-2 rounded-xl bg-glass-bg px-3 py-2 backdrop-blur-lg shadow-glass">
      <Search className="h-5 w-5 text-color-base" />
      <Input
        id="search"
        className="flex-1 bg-transparent text-color-base placeholder:text-glass-text-secondary"
        placeholder="검색어 입력"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <GlassButton
        variant="primary"
        onClick={handleSearch}
        className="whitespace-nowrap"
      >
        검색
      </GlassButton>
    </div>
  );
}
