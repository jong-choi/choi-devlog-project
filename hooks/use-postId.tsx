import { getPostByUrlSlug } from "@/app/post/actions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// (deprecated)
export function usePostId() {
  const { postId: paramPostId, urlSlug } = useParams();
  // return { postId: "" };
  const [postId, setPostId] = useState<string | null | undefined>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paramPostId && typeof paramPostId === "string") {
      setPostId(paramPostId);
      return;
    }
    if (typeof urlSlug !== "string") return;

    async function fetchPostId(urlSlug: string) {
      setLoading(true);
      const result = await getPostByUrlSlug(urlSlug);
      setPostId(result.data?.id);
      setLoading(false);
    }

    fetchPostId(decodeURIComponent(urlSlug));
  }, [paramPostId, urlSlug]);

  return { postId, loading };
}
