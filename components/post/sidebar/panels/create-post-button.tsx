import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Button } from "@ui/button";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generate } from "random-words";

export default function CreatePostButton() {
  const subcategoryId = useSidebarStore(
    (state) => state.selectedSubcategory?.id
  );

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    setIsLoading(true);
    const randomWords = ["create", ...(generate(2) as string[])];
    const urlSlug = randomWords.join("-");
    const params = new URLSearchParams(
      subcategoryId ? { subcategory_id: subcategoryId } : {}
    );
    const url = `/post/${urlSlug}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.push(url);
    setIsLoading(false);
  };

  return (
    <Button variant="secondary" onClick={onClick}>
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      ) : (
        <span className="flex items-center gap-1">
          <Plus className="w-7 h-7 text-gray-500" />새 글 작성
        </span>
      )}
    </Button>
  );
}
