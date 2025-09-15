"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import QueryTestSection from "@/components/admin/embedding/query-test-section";
import SymanticSearchTestSection from "@/components/admin/embedding/symantic-search-test-section";
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
      toast.error(`에러: ${String(error)}`);
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
      toast.error(`에러: ${String(error)}`);
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
      if (targets.length === 0) return;

      // SSE 연결 (GET /batch?ids=...)
      const params = new URLSearchParams({ ids: targets.join(",") });
      const url = `/api/embedding/generate/document/batch?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
        },
      });

      if (!response.ok || !response.body) {
        throw new Error("SSE 연결 실패");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const flush = () => {
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const evt of events) {
          const lines = evt.split("\n");
          let eventName = "message";
          let dataLine = "";
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLine = line.slice(5).trim();
            }
          }
          if (dataLine) {
            try {
              const payload = JSON.parse(dataLine);
              if (eventName === "item") {
                const title: string = payload.title || payload.postId;
                toast.success(`'${title}' 임베딩이 생성되었습니다`);
              } else if (eventName === "done") {
                toast.success(
                  `배치 완료: 성공 ${payload.success}, 실패 ${payload.error}, 없음 ${payload.not_found}`,
                );
              } else if (eventName === "error") {
                toast.error(`배치 에러: ${payload.error ?? "알 수 없음"}`);
              }
            } catch (error) {
              toast.error(`JSON 변환 실패 ${error}`);
            }
          }
        }
      };

      // 스트림 루프
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        flush();
      }
      // 남은 버퍼 처리
      buffer += decoder.decode();
      flush();
    } finally {
      setBatchLoading(false);
      loadTableData(page);
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
      {/* 쿼리 검색 섹션 */}
      <QueryTestSection />
      {/* 시맨틱 검색 섹션 */}
      <SymanticSearchTestSection />
    </div>
  );
}
