import type { SearchTestResult } from "@/types/semantic-search";

interface SearchTestResultsProps {
  results: SearchTestResult[];
  error: string | null;
}

export default function SearchTestResults({ results, error }: SearchTestResultsProps) {
  if (error) {
    return <div className="mb-4 text-red-600">에러: {error}</div>;
  }

  return (
    <div className="space-y-3">
      {results.length === 0 && (
        <div className="text-slate-500">아직 검색 결과가 없습니다.</div>
      )}

      {results.map((result) => (
        <SearchResultItem key={`${result.post_id}-${result.url_slug}`} result={result} />
      ))}
    </div>
  );
}

function SearchResultItem({ result }: { result: SearchTestResult }) {
  const displayContent = result.chunk_content ?? result.short_description;
  const truncatedContent = displayContent && displayContent.length > 300
    ? displayContent.slice(0, 300) + " ..."
    : displayContent;

  return (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium flex items-center gap-3">
          <span className="text-slate-800">{result.title}</span>
          <span className="text-slate-600">
            리랭킹:{" "}
            {result.rerank_score !== undefined
              ? result.rerank_score.toFixed(3)
              : "-"}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          유사도: {result.cosine_similarity.toFixed(3)} · FTS:{" "}
          {result.fts_rank.toFixed(3)}
        </div>
      </div>
      <div className="text-xs text-slate-600 mt-1">
        /post/{result.url_slug}
      </div>
      {truncatedContent && (
        <div className="text-sm text-slate-800 mt-2 whitespace-pre-wrap">
          {truncatedContent}
        </div>
      )}
    </div>
  );
}