"use client";

import { useState } from "react";
import SearchTestForm from "@/components/admin/embedding/search-test-form";
import SearchTestResults from "@/components/admin/embedding/search-test-results";
import type { SearchTestResult } from "@/types/semantic-search";
import type { SearchTestFormData } from "@/lib/schemas/admin/search-test";

export default function SemanticSearchTestSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchTestResult[]>([]);

  const handleSubmit = async (data: SearchTestFormData) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/posts/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

      <SearchTestForm onSubmit={handleSubmit} loading={loading} />
      <SearchTestResults results={results} error={error} />
    </div>
  );
}
