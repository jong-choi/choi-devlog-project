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
}

export function SummaryHydrator({
  summary,
  recommendedPosts,
}: ChatHeaderProps) {
  const { setSummary, setRecommended } = useSummary(
    useShallow((state) => {
      return {
        setSummary: state.setSummary,
        setRecommended: state.setRecommendedPosts,
      };
    })
  );

  useEffect(() => {
    setSummary(summary);
  }, [setSummary, summary]);

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
