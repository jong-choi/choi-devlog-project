import { useRef, useState } from "react";

export default function QueryTestSection() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchK, setSearchK] = useState<number>(8);
  const [searchMinSim, setSearchMinSim] = useState<number>(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<
    Array<{
      chunk_id: string;
      post_id: string;
      chunk_index: number;
      content: string;
      similarity: number;
      rerankScore: number | null;
    }>
  >([]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const value = (searchInputRef.current?.value ?? "").trim();
    if (!value) return;

    setSearchLoading(true);
    try {
      const res = await fetch("/api/embedding/generate/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: value,
          k: searchK,
          minSimilarity: searchMinSim,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error || `status ${res.status}`);
      }

      setSearchResults(Array.isArray(body.results) ? body.results : []);
    } catch (err) {
      setSearchError(String(err));
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-xl font-semibold mb-4">코사인 검색 테스트</h2>

      <form
        onSubmit={handleSearchSubmit}
        className="grid grid-cols-1 gap-3 mb-4"
      >
        {/* 쿼리 입력 */}
        <div className="flex gap-2">
          <input
            ref={searchInputRef}
            placeholder="검색할 쿼리를 입력하세요"
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 text-white rounded"
            disabled={searchLoading}
          >
            {searchLoading ? "검색중..." : "검색"}
          </button>
        </div>

        {/* 파라미터 설정 */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <span>K</span>
            <input
              type="number"
              min={1}
              max={100}
              value={searchK}
              onChange={(e) => setSearchK(Number(e.target.value) || 1)}
              className="w-20 rounded border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>minSimilarity</span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={searchMinSim}
              onChange={(e) =>
                setSearchMinSim(
                  Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                )
              }
              className="w-28 rounded border px-2 py-1"
            />
          </label>
        </div>
      </form>

      {searchError && (
        <div className="mb-4 text-red-600">에러: {searchError}</div>
      )}

      <div className="space-y-3">
        {searchResults.length === 0 && (
          <div className="text-slate-500">아직 검색 결과가 없습니다.</div>
        )}

        {searchResults.map((r) => (
          <div key={r.chunk_id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium flex items-center gap-3">
                <span>유사도: {r.similarity.toFixed(3)}</span>
                <span className="text-slate-600">
                  리랭킹:{" "}
                  {r.rerankScore !== null ? r.rerankScore.toFixed(3) : "-"}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                post_id: {r.post_id} / chunk_index: {r.chunk_index}
              </div>
            </div>
            <div className="text-sm text-slate-800 mt-2 whitespace-pre-wrap">
              {r.content.length > 300
                ? r.content.slice(0, 300) + " ..."
                : r.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
