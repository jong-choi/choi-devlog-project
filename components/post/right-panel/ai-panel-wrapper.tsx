import { getAISummaryByPostId } from "@/app/post/actions";
import { DEFAULT_SUMMARY } from "@/lib/constants/post";
import { SummaryProvider } from "@/providers/summary-store-provider";
import { Database } from "@/types/supabase";

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
  if (data?.id) {
    const { data: aiData } = await getAISummaryByPostId(data.id);
    if (aiData?.summary) {
      summary = aiData.summary;
      summaryId = aiData.id;
    }
  }

  return (
    <SummaryProvider initialState={{ summary, summaryId }}>
      {children}
    </SummaryProvider>
  );
}
