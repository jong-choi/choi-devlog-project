"use client";

import { useRef, useState } from "react";

export default function SemanticSearchTestSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overSampleCount, setOverSampleCount] = useState<number>(25);
  const [minThreshold, setMinThreshold] = useState<number>(0.3);
  const [maxResults, setMaxResults] = useState<number>(10);
  const [minResults, setMinResults] = useState<number>(5);
  const [ftsWeight, setFtsWeight] = useState<number>(0.5);
  const [vectorWeight, setVectorWeight] = useState<number>(0.5);
  const [rrfK, setRrfK] = useState<number>(60);
  const [results, setResults] = useState<
    Array<{
      post_id: string;
      title: string;
      short_description: string | null;
      chunk_content: string | null;
      chunk_index: number | null;
      url_slug: string;
      thumbnail: string | null;
      rerank_score?: number;
      fts_rank: number;
      cosine_similarity: number;
    }>
  >([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = (inputRef.current?.value ?? "").trim();
    if (!value) return;
    setLoading(true);
    try {
      const res = await fetch("/api/posts/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: value,
          overSampleCount,
          minThreshold,
          maxResults,
          minResults,
          ftsWeight,
          vectorWeight,
          rrfK,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error || `status ${res.status}`);
      }
      setResults(Array.isArray(body.results) ? body.results : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-xl font-semibold mb-4">
        하이브리드 시멘틱 검색 테스트
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 mb-4">
        {/* 쿼리 입력 */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            placeholder="검색할 쿼리를 입력하세요"
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 text-white rounded"
            disabled={loading}
          >
            {loading ? "검색중..." : "검색"}
          </button>
        </div>

        {/* 파라미터 설정 */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <span>overSample</span>
            <input
              type="number"
              min={10}
              max={50}
              value={overSampleCount}
              onChange={(e) =>
                setOverSampleCount(
                  Math.max(10, Math.min(50, Number(e.target.value) || 25)),
                )
              }
              className="w-24 rounded border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>minThreshold</span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={minThreshold}
              onChange={(e) =>
                setMinThreshold(
                  Math.max(0, Math.min(1, Number(e.target.value) || 0.3)),
                )
              }
              className="w-28 rounded border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>maxResults</span>
            <input
              type="number"
              min={1}
              max={50}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value) || 10)}
              className="w-24 rounded border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>minResults</span>
            <input
              type="number"
              min={1}
              max={20}
              value={minResults}
              onChange={(e) => setMinResults(Number(e.target.value) || 5)}
              className="w-24 rounded border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>FTS weight</span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={ftsWeight}
              onChange={(e) =>
                setFtsWeight(
                  Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                )
              }
              className="w-24 rounded border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Vector weight</span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={vectorWeight}
              onChange={(e) =>
                setVectorWeight(
                  Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                )
              }
              className="w-28 rounded border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>RRF k</span>
            <input
              type="number"
              min={1}
              max={200}
              value={rrfK}
              onChange={(e) => setRrfK(Number(e.target.value) || 60)}
              className="w-24 rounded border px-2 py-1"
            />
          </label>
        </div>
      </form>

      {error && <div className="mb-4 text-red-600">에러: {error}</div>}

      <div className="space-y-3">
        {results.length === 0 && (
          <div className="text-slate-500">아직 검색 결과가 없습니다.</div>
        )}

        {results.map((r) => (
          <div key={r.post_id + r.url_slug} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium flex items-center gap-3">
                <span className="text-slate-800">{r.title}</span>
                <span className="text-slate-600">
                  리랭킹:{" "}
                  {r.rerank_score !== undefined
                    ? r.rerank_score?.toFixed(3)
                    : "-"}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                유사도: {r.cosine_similarity?.toFixed(3)} · FTS:{" "}
                {r.fts_rank?.toFixed(3)}
              </div>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              /post/{r.url_slug}
            </div>
            {(r.chunk_content || r.short_description) && (
              <div className="text-sm text-slate-800 mt-2 whitespace-pre-wrap">
                {/* 청크가 있으면 청크를, 없으면 짧은 설명을 노출 */}
                {(r.chunk_content ?? r.short_description)!.length > 300
                  ? (r.chunk_content ?? r.short_description)!.slice(0, 300) +
                    " ..."
                  : (r.chunk_content ?? r.short_description)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
