"use client";

import { useState } from "react";
import QueryTestForm from "@/components/admin/embedding/query-test-form";
import QueryTestResults from "@/components/admin/embedding/query-test-results";
import type { QueryTestResult } from "@/types/semantic-search";
import type { QueryTestFormData } from "@/lib/schemas/admin/query-test";

export default function QueryTestSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QueryTestResult[]>([]);

  const handleSubmit = async (data: QueryTestFormData) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/embedding/generate/query", {
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
      <h2 className="text-xl font-semibold mb-4">코사인 검색 테스트</h2>

      <QueryTestForm onSubmit={handleSubmit} loading={loading} />
      <QueryTestResults results={results} error={error} />
    </div>
  );
}
