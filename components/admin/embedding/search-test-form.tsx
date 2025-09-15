"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  searchTestSchema,
  type SearchTestFormData,
  SEARCH_TEST_DEFAULTS,
  SEARCH_TEST_CONSTRAINTS,
} from "@/lib/schemas/admin/search-test";

interface SearchTestFormProps {
  onSubmit: (data: SearchTestFormData) => void;
  loading: boolean;
}

export default function SearchTestForm({ onSubmit, loading }: SearchTestFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SearchTestFormData>({
    resolver: zodResolver(searchTestSchema),
    defaultValues: SEARCH_TEST_DEFAULTS,
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
          <span>overSample</span>
          <input
            {...register("overSampleCount", { valueAsNumber: true })}
            type="number"
            min={SEARCH_TEST_CONSTRAINTS.overSampleCount.min}
            max={SEARCH_TEST_CONSTRAINTS.overSampleCount.max}
            className="w-24 rounded border px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          <span>minThreshold</span>
          <input
            {...register("minThreshold", { valueAsNumber: true })}
            type="number"
            min={SEARCH_TEST_CONSTRAINTS.minThreshold.min}
            max={SEARCH_TEST_CONSTRAINTS.minThreshold.max}
            step={SEARCH_TEST_CONSTRAINTS.minThreshold.step}
            className="w-28 rounded border px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          <span>maxResults</span>
          <input
            {...register("maxResults", { valueAsNumber: true })}
            type="number"
            min={SEARCH_TEST_CONSTRAINTS.maxResults.min}
            max={SEARCH_TEST_CONSTRAINTS.maxResults.max}
            className="w-24 rounded border px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          <span>minResults</span>
          <input
            {...register("minResults", { valueAsNumber: true })}
            type="number"
            min={SEARCH_TEST_CONSTRAINTS.minResults.min}
            max={SEARCH_TEST_CONSTRAINTS.minResults.max}
            className="w-24 rounded border px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          <span>FTS weight</span>
          <input
            {...register("ftsWeight", { valueAsNumber: true })}
            type="number"
            min={SEARCH_TEST_CONSTRAINTS.ftsWeight.min}
            max={SEARCH_TEST_CONSTRAINTS.ftsWeight.max}
            step={SEARCH_TEST_CONSTRAINTS.ftsWeight.step}
            className="w-24 rounded border px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          <span>Vector weight</span>
          <input
            {...register("vectorWeight", { valueAsNumber: true })}
            type="number"
            min={SEARCH_TEST_CONSTRAINTS.vectorWeight.min}
            max={SEARCH_TEST_CONSTRAINTS.vectorWeight.max}
            step={SEARCH_TEST_CONSTRAINTS.vectorWeight.step}
            className="w-28 rounded border px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          <span>RRF k</span>
          <input
            {...register("rrfK", { valueAsNumber: true })}
            type="number"
            min={SEARCH_TEST_CONSTRAINTS.rrfK.min}
            max={SEARCH_TEST_CONSTRAINTS.rrfK.max}
            className="w-24 rounded border px-2 py-1"
          />
        </label>
      </div>
    </form>
  );
}