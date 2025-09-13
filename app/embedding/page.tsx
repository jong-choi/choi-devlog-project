"use client";

import React, { useState } from "react";

export default function EmbeddingPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<
    Array<{ input: string; vector: number[] }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = input.trim();
    if (!value) return;

    setLoading(true);
    try {
      const res = await fetch("/api/embedding", {
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
    </div>
  );
}
