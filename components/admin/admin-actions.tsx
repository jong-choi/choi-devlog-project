"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRevalidator } from "@/hooks/use-revalidator";
import { CACHE_TAGS } from "@/utils/nextCache";

export default function AdminActions() {
  const revalidateCacheTags = useRevalidator();
  const revalidateAdminAPI = async () => {
    await fetch("/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
  const [generatingAllSimilarity, setGeneratingAllSimilarity] = useState(false);
  const [generatingClusters, setGeneratingClusters] = useState(false);

  const handleCreateAllSimilarity = async () => {
    setGeneratingAllSimilarity(true);

    try {
      const response = await fetch("/api/similarity/generate", {
        method: "POST",
      });

      if (!response.ok) {
        toast.error("추천 게시글 생성에 실패했습니다.");
        return;
      }

      const data = await response.json();

      await revalidateCacheTags([CACHE_TAGS.POST.ALL()]);

      toast.success(`추천 게시글 생성 완료 (${data.count}개 유사도 계산)`);
    } catch (error) {
      console.error(error);
      toast.error("추천 게시글 생성 중 오류가 발생했습니다.");
    } finally {
      setGeneratingAllSimilarity(false);
    }
  };

  const handleCreateClusters = async () => {
    setGeneratingClusters(true);

    try {
      const response = await fetch("/api/similarity/cluster/generate", {
        method: "POST",
      });

      if (!response.ok) {
        toast.error("게시글 군집 생성에 실패했습니다.");
        return;
      }

      const data = await response.json();

      await revalidateCacheTags([CACHE_TAGS.CLUSTER.ALL()]);
      await revalidateAdminAPI();

      toast.success(
        `게시글 군집 생성 완료 (${data.count}개 군집 생성, ${data.clusteredPostCount}개 게시글 군집화)`,
      );
    } catch (error) {
      console.error(error);
      toast.error("게시글 군집 생성 중 오류가 발생했습니다.");
    } finally {
      setGeneratingClusters(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleCreateClusters}
        variant="default"
        disabled={generatingClusters}
        className="px-6 py-2"
      >
        {generatingClusters ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            게시글 군집 생성중...
          </>
        ) : (
          "게시글 군집 생성하기"
        )}
      </Button>
      <Button
        onClick={handleCreateAllSimilarity}
        variant="default"
        disabled={generatingAllSimilarity}
        className="px-6 py-2"
      >
        {generatingAllSimilarity ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            유사도 생성 중...
          </>
        ) : (
          "모든 게시글 유사도 생성"
        )}
      </Button>
    </div>
  );
}
