"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  queryTestSchema,
  type QueryTestFormData,
  QUERY_TEST_DEFAULTS,
  QUERY_TEST_CONSTRAINTS,
} from "@/lib/schemas/admin/query-test";

interface QueryTestFormProps {
  onSubmit: (data: QueryTestFormData) => void;
  loading: boolean;
}

export default function QueryTestForm({ onSubmit, loading }: QueryTestFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<QueryTestFormData>({
    resolver: zodResolver(queryTestSchema),
    defaultValues: QUERY_TEST_DEFAULTS,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 mb-4">
      <div className="flex gap-2">
        <input
          {...register("query")}
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
      {errors.query && (
        <div className="text-red-600 text-sm">{errors.query.message}</div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <label className="flex items-center gap-2">
          <span>K</span>
          <input
            {...register("k", { valueAsNumber: true })}
            type="number"
            min={QUERY_TEST_CONSTRAINTS.k.min}
            max={QUERY_TEST_CONSTRAINTS.k.max}
            className="w-20 rounded border px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          <span>minSimilarity</span>
          <input
            {...register("minSimilarity", { valueAsNumber: true })}
            type="number"
            min={QUERY_TEST_CONSTRAINTS.minSimilarity.min}
            max={QUERY_TEST_CONSTRAINTS.minSimilarity.max}
            step={QUERY_TEST_CONSTRAINTS.minSimilarity.step}
            className="w-28 rounded border px-2 py-1"
          />
        </label>
      </div>
    </form>
  );
}