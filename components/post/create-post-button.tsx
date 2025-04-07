"use client";
import { Button } from "@ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { generate } from "random-words";
import { LinkLoader } from "@ui/route-loader";

export default function CreatePostButton({
  subcategoryId,
}: {
  subcategoryId?: string;
}) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const randomWords = ["create", ...(generate(2) as string[])];
    const urlSlug = randomWords.join("-");
    const params = new URLSearchParams(
      subcategoryId ? { subcategory_id: subcategoryId } : {}
    );
    const url = `/post/${urlSlug}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    setUrl(url);
  }, [subcategoryId]);

  return (
    <LinkLoader href={url}>
      <Button variant="secondary" size={"sm"}>
        <span className="flex items-center gap-1">
          <Plus className="w-4 h-4 text-gray-500" />새 글 작성
        </span>
      </Button>
    </LinkLoader>
  );
}
