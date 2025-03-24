import { createAISummary } from "@/app/post/actions";

interface SummaryResponse {
  summary?: string;
  vector?: number[];
  error?: string;
}

async function generateSummary(
  title: string,
  body: string
): Promise<SummaryResponse> {
  try {
    const response = await fetch("/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate summary: ${response.statusText}`);
    }

    const data: SummaryResponse = await response.json();
    return data; // 요약 및 벡터 데이터 반환
  } catch (error) {
    console.error("Error generating summary:", error);
    return { error: "Failed to generate summary" };
  }
}

export default async function createCrawledAISummary(
  data: {
    post_id?: string;
    title?: string;
    body?: string;
  } | null
) {
  if (!data || !data.post_id || !data.title || !data.body) return;
  const res = await generateSummary(data.title, data.body);
  if (!res.summary || !res.vector) return res;
  const payload = {
    post_id: data.post_id,
    summary: res.summary,
    vector: res.vector,
  };

  return createAISummary(payload);
}
