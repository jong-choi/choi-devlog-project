import { z } from "zod";

export const QUERY_TEST_DEFAULTS = {
  query: "",
  k: 8,
  minSimilarity: 0,
} as const;

export const QUERY_TEST_CONSTRAINTS = {
  k: { min: 1, max: 100 },
  minSimilarity: { min: 0, max: 1, step: 0.05 },
} as const;

export const queryTestSchema = z.object({
  query: z.string().min(1, "검색어를 입력해주세요"),
  k: z
    .number()
    .min(QUERY_TEST_CONSTRAINTS.k.min)
    .max(QUERY_TEST_CONSTRAINTS.k.max),
  minSimilarity: z
    .number()
    .min(QUERY_TEST_CONSTRAINTS.minSimilarity.min)
    .max(QUERY_TEST_CONSTRAINTS.minSimilarity.max),
});

export type QueryTestFormData = z.infer<typeof queryTestSchema>;