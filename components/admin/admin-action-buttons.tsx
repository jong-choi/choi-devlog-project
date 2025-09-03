"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPostData } from "@/app/api/(fetchers)/admin/route";
import { createAISummary, createTagsByPostId } from "@/app/post/actions";
import { Button } from "@/components/ui/button";
import { useRevalidator } from "@/hooks/use-revalidator";
import { CACHE_TAGS } from "@/utils/nextCache";

type AdminActionButtonsProps = {
  post: AdminPostData;
  type: "summary" | "similarity";
};

export default function AdminActionButtons({
  post,
  type,
}: AdminActionButtonsProps) {
  const revalidateCacheTags = useRevalidator();

  const [loading, setLoading] = useState(false);

  const createSummary = async (title: string, body: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/summary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      console.error(data.error);
      return null;
    }

    const data = await response.json();
    return data;
  };

  const handleCreateSummary = async () => {
    setLoading(true);

    try {
      if (!post.url_slug || !post.id) {
        throw new Error("게시글 정보가 없습니다.");
      }

      const postResponse = await fetch(
        `/api/posts/slug?urlSlug=${encodeURIComponent(post.url_slug)}`,
      );
      if (!postResponse.ok) {
        toast.error("게시글 내용을 가져올 수 없습니다.");
        return;
      }

      const response = await postResponse.json();
      if (response.error || !response.data) {
        toast.error("게시글 내용을 가져올 수 없습니다.");
        return;
      }

      const postData = response.data;
      const data = await createSummary(postData.title, postData.body);

      if (!data || !data.summary) {
        toast.error("인공지능 요약 생성에 실패하였습니다.");
        return;
      }

      const { summary, vector } = data;
      const payload = {
        post_id: post.id,
        summary,
        vector,
      };

      const { data: AIData } = await createAISummary(payload);
      if (!AIData || !AIData.id) {
        toast.error("요약을 DB에 등록하지 못하였습니다.");
        return;
      }

      const TagsData = await createTagsByPostId({
        post_id: AIData.post_id || "",
        id: AIData.id,
        summary: AIData.summary,
      });

      if (!TagsData || !TagsData.post_id) {
        toast.error("태그를 생성하지 못하였습니다.");
        return;
      }

      await revalidateCacheTags([
        CACHE_TAGS.POST.BY_URL_SLUG(postData.url_slug),
        CACHE_TAGS.AI_SUMMARY.BY_POST_ID(post.id),
      ]);
      toast.success("요약 생성에 성공하였습니다.");
    } catch (error) {
      console.error(error);
      toast.error("요약 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSimilarity = async () => {
    setLoading(true);

    try {
      if (!post.id) throw new Error("게시글 id가 없습니다.");
      const response = await fetch("/api/summary/recommended", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "추천 게시글 생성에 실패했습니다.");
        return;
      }

      await response.json();

      await revalidateCacheTags([CACHE_TAGS.AI_SUMMARY.BY_POST_ID(post.id)]);

      toast.success("추천 게시글 생성에 성공했습니다.");
    } catch (error) {
      console.error("추천 게시글 생성 오류:", error);
      toast.error("추천 게시글 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick =
    type === "summary" ? handleCreateSummary : handleCreateSimilarity;
  const buttonText = type === "summary" ? "요약" : "추천";

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      disabled={loading}
      className="h-6 text-xs"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : buttonText}
    </Button>
  );
}
