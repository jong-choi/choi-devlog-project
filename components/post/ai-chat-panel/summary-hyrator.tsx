"use client";
import { useSummary } from "@/providers/summary-store-provider";
import { Database } from "@/types/supabase";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

interface ChatHeaderProps {
  summary: string;
  recommendedPosts: Array<
    Database["public"]["Views"]["post_similarities_with_target_info"]["Row"]
  >;
  postId: string;
}

export function SummaryHydrator({
  summary,
  recommendedPosts,
  postId,
}: ChatHeaderProps) {
  const { setSummary, setSummaryId, setRecommended } = useSummary(
    useShallow((state) => {
      return {
        setSummary: state.setSummary,
        setSummaryId: state.setSummaryId,
        setRecommended: state.setRecommendedPosts,
      };
    })
  );

  useEffect(() => {
    setSummaryId(postId);
    setSummary(summary);
  }, [postId, setSummary, setSummaryId, summary]);

  useEffect(() => {
    const recommended = recommendedPosts.map((sim) => {
      return {
        id: sim.target_post_id || "",
        title: sim.target_title || "",
        urlSlug: sim.target_url_slug || "",
      };
    });
    setRecommended(recommended);
  }, [recommendedPosts, setRecommended]);

  return null;
}
