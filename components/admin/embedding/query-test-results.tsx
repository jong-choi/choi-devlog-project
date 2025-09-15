import type { QueryTestResult } from "@/types/semantic-search";

interface QueryTestResultsProps {
  results: QueryTestResult[];
  error: string | null;
}

export default function QueryTestResults({ results, error }: QueryTestResultsProps) {
  if (error) {
    return <div className="mb-4 text-red-600">에러: {error}</div>;
  }

  return (
    <div className="space-y-3">
      {results.length === 0 && (
        <div className="text-slate-500">아직 검색 결과가 없습니다.</div>
      )}

      {results.map((result) => (
        <QueryResultItem key={result.chunk_id} result={result} />
      ))}
    </div>
  );
}

function QueryResultItem({ result }: { result: QueryTestResult }) {
  const truncatedContent = result.content.length > 300
    ? result.content.slice(0, 300) + " ..."
    : result.content;

  return (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium flex items-center gap-3">
          <span>유사도: {result.similarity.toFixed(3)}</span>
          <span className="text-slate-600">
            리랭킹:{" "}
            {result.rerankScore !== null ? result.rerankScore.toFixed(3) : "-"}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          post_id: {result.post_id} / chunk_index: {result.chunk_index}
        </div>
      </div>
      <div className="text-sm text-slate-800 mt-2 whitespace-pre-wrap">
        {truncatedContent}
      </div>
    </div>
  );
}