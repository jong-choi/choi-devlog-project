"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// 임베딩 관리 페이지
export default function EmbeddingPage() {
  // 테이블 데이터 상태
  type TableRow = {
    id: string;
    title: string;
    activeCount: number;
    totalCount: number;
  };
  const [rows, setRows] = useState<TableRow[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [hasMore, setHasMore] = useState(false);
  const [rowActionLoading, setRowActionLoading] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // 코사인 검색 상태
  const [searchInput, setSearchInput] = useState("");
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

  const missingCount = useMemo(
    () => rows.filter((r) => r.activeCount === 0).length,
    [rows],
  );

  const loadTableData = useCallback(
    async (targetPage: number) => {
      setTableLoading(true);
      try {
        const supabase = createClient();

        const from = targetPage * pageSize;
        const to = from + pageSize - 1;
        const { data: rowsData, error } = await supabase
          .from("v_post_with_chunk_counts")
          .select("id, title, created_at, active_count, total_count")
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw new Error(error.message);

        const nextRows: TableRow[] = (rowsData || [])
          .filter((post) => post.id && post.title)
          .map((post) => ({
            id: post.id!,
            title: post.title!,
            activeCount: post.active_count ?? 0,
            totalCount: post.total_count ?? 0,
          }));

        setRows(nextRows);

        // 다음 페이지 존재 여부 추정 (다음 범위를 한 건 더 조회)
        const { data: moreCheck } = await supabase
          .from("v_post_with_chunk_counts")
          .select("id")
          .order("created_at", { ascending: false })
          .range(to + 1, to + 1);
        setHasMore((moreCheck || []).length > 0);
      } finally {
        setTableLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    loadTableData(0);
  }, [loadTableData]);

  // 개별 임베딩 생성/업데이트
  const handleGenerateEmbedding = async (postId: string) => {
    setRowActionLoading(postId);
    try {
      const res = await fetch("/api/embedding/generate/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `status ${res.status}`);
    } catch (error) {
      alert(`에러: ${String(error)}`);
    } finally {
      setRowActionLoading(null);
      loadTableData(page);
    }
  };

  // 개별 임베딩 하드 삭제
  const handleDeleteEmbedding = async (postId: string) => {
    if (
      !confirm("정말로 이 게시글의 모든 임베딩 청크를 삭제할까요? (하드 삭제)")
    )
      return;
    setRowActionLoading(postId);
    try {
      const res = await fetch(`/api/embedding/chunks/${postId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `status ${res.status}`);
    } catch (error) {
      alert(`에러: ${String(error)}`);
    } finally {
      setRowActionLoading(null);
      loadTableData(page);
    }
  };

  // 누락된 임베딩 일괄 생성 (활성 청크 0개 대상)
  const handleGenerateMissing = async () => {
    if (missingCount === 0) return;
    if (
      !confirm(
        `활성 청크 0개인 ${missingCount}개 게시글에 대해 임베딩을 생성할까요?`,
      )
    )
      return;
    setBatchLoading(true);
    try {
      const targets = rows.filter((r) => r.activeCount === 0).map((r) => r.id);
      for (const postId of targets) {
        // await로 순차처리
        try {
          const res = await fetch("/api/embedding/generate/document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: postId }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            console.error(
              "임베딩 생성 실패:",
              postId,
              body?.error || res.status,
            );
          }
        } catch (e) {
          console.error("임베딩 생성 에러:", postId, e);
        }
      }
    } finally {
      setBatchLoading(false);
      loadTableData(page);
    }
  };

  // 코사인 검색 요청 핸들러 (기존 유지)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const value = searchInput.trim();
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
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">임베딩 관리</h1>

      {/* 상단 액션 바 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">
          페이지 {page + 1}
          <span className="mx-2">·</span>
          표시 {rows.length}건
          {missingCount > 0 && (
            <span className="ml-2 text-amber-700">(누락 {missingCount}건)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateMissing}
            disabled={batchLoading || missingCount === 0 || tableLoading}
            className="px-3 py-2 rounded text-sm bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {batchLoading ? "누락 임베딩 생성중..." : "누락된 임베딩 생성"}
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2 w-[44%]">게시글 제목</th>
              <th className="text-right px-3 py-2 w-[12%]">임베딩 청크수</th>
              <th className="text-right px-3 py-2 w-[12%]">전체 청크수</th>
              <th className="text-center px-3 py-2 w-[16%]">생성/업데이트</th>
              <th className="text-center px-3 py-2 w-[16%]">
                임베딩 하드 삭제
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-800 line-clamp-2">
                    {r.title}
                  </div>
                  <div className="text-xs text-slate-500">ID: {r.id}</div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.activeCount}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.totalCount}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleGenerateEmbedding(r.id)}
                    disabled={!!rowActionLoading || tableLoading}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rowActionLoading === r.id
                      ? "처리중..."
                      : "임베딩 생성/업데이트"}
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDeleteEmbedding(r.id)}
                    disabled={!!rowActionLoading || tableLoading}
                    className="px-3 py-1.5 rounded bg-rose-600 text-white text-xs hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rowActionLoading === r.id ? "처리중..." : "임베딩 삭제"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between mt-3">
        <button
          className="px-3 py-1.5 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={tableLoading || page === 0}
          onClick={() => {
            const next = Math.max(0, page - 1);
            setPage(next);
            loadTableData(next);
          }}
        >
          이전
        </button>
        <button
          className="px-3 py-1.5 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={tableLoading || !hasMore}
          onClick={() => {
            const next = page + 1;
            setPage(next);
            loadTableData(next);
          }}
        >
          다음
        </button>
      </div>

      {/* 코사인 검색 테스트 섹션 (기존 유지) */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">코사인 검색 테스트</h2>

        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-3 mb-4"
        >
          {/* 쿼리 입력 */}
          <div className="flex gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
    </div>
  );
}
