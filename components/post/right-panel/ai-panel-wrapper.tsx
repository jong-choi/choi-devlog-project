import {
  getAISummaryByPostId,
  getRecommendedListByPostId,
} from "@/app/post/fetchers";
import { DEFAULT_SUMMARY } from "@/lib/constants/post";
import { SummaryProvider } from "@/providers/summary-store-provider";
import { Post } from "@/types/post";
import { Database } from "@/types/supabase";
import { simsToPosts } from "@/utils/uploadingUtils";

interface AIPanelWrapperProps {
  data: Database["public"]["Tables"]["posts"]["Row"] | null;
  children?: React.ReactNode;
}

export default async function AIPanelWrapper({
  data,
  children,
}: AIPanelWrapperProps) {
  let summary = DEFAULT_SUMMARY;
  let summaryId = null;
  let recommendedPosts: Post[] = [];
  if (data?.id) {
    const { data: aiData } = await getAISummaryByPostId(data.id);
    if (aiData?.summary) {
      summary = aiData.summary;
      summaryId = aiData.id;
    }
    const { data: postsData } = await getRecommendedListByPostId(data.id);

    if (postsData) {
      recommendedPosts = simsToPosts(postsData);
    }
  }

  return (
    <SummaryProvider initialState={{ summary, summaryId, recommendedPosts }}>
      {children}
    </SummaryProvider>
  );
}
