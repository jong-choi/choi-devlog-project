"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// 임베딩 테스트 페이지
export default function EmbeddingPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<
    Array<{ input: string; vector: number[] }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<
    Array<{ id: string | null; title: string | null }>
  >([]);
  const [generateLoading, setGenerateLoading] = useState<string | null>(null);

  // 코사인 검색 테스트용 상태
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = input.trim();
    if (!value) return;

    setLoading(true);
    try {
      const res = await fetch("/api/embedding/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: value }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `status ${res.status}`);
      }

      const data = await res.json();
      setResults((s) => [{ input: value, vector: data.vector ?? [] }, ...s]);
      setInput("");
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchRecentPosts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("published_posts")
        .select("id, title")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentPosts(data);
      }
    }

    fetchRecentPosts();
  }, []);

  async function handleGenerateEmbedding(postId: string) {
    setGenerateLoading(postId);
    try {
      const res = await fetch("/api/embedding/generate/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`에러: ${data.error || `status ${res.status}`}`);
      } else {
        alert(
          `성공: 포스트 ${data.postId}에 대해 ${data.chunkCount}개의 청크가 생성되었습니다.`,
        );
      }
    } catch (error) {
      alert(`에러: ${String(error)}`);
    } finally {
      setGenerateLoading(null);
    }
  }

  // 코사인 검색 요청 핸들러
  async function handleSearchSubmit(e: React.FormEvent) {
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
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Embedding 테스트</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="텍스트를 입력하세요"
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 text-white rounded"
          disabled={loading}
        >
          {loading ? "처리중..." : "임베딩"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600">에러: {error}</div>}

      <div className="space-y-4">
        {results.length === 0 && (
          <div className="text-slate-500">
            아직 결과가 없습니다. 텍스트를 입력하여 임베딩을 생성하세요.
          </div>
        )}

        {results.map((r, idx) => (
          <div key={idx} className="border rounded p-3">
            <div className="font-medium">입력</div>
            <div className="mb-2">{r.input}</div>
            <div className="font-medium">벡터 ({r.vector.length})</div>
            <div className="text-xs font-mono overflow-x-auto mt-2 bg-slate-50 p-2 rounded">
              {r.vector.length > 0
                ? JSON.stringify(r.vector.slice(0, 80)) +
                  (r.vector.length > 80 ? " ..." : "")
                : "[]"}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">최근 게시글 10개</h2>
        <div className="space-y-2">
          {recentPosts.length === 0 && (
            <div className="text-slate-500">게시글을 불러오는 중...</div>
          )}
          {recentPosts.map((post) => {
            if (!post.id || !post.title) {
              return null;
            }
            return (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-slate-50"
              >
                <div>
                  <div className="font-medium">{post.title}</div>
                  <div className="text-sm text-slate-500">ID: {post.id}</div>
                </div>
                <button
                  onClick={() => handleGenerateEmbedding(post.id!)}
                  disabled={generateLoading !== null}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generateLoading === post.id ? "생성중..." : "임베딩 생성"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 코사인 검색 테스트 섹션 */}
      <div className="mt-8 border-t pt-6">
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
