import { z } from "zod";

export const SEARCH_TEST_DEFAULTS = {
  query: "",
  overSampleCount: 25,
  minThreshold: 0.3,
  maxResults: 10,
  minResults: 5,
  ftsWeight: 0.5,
  vectorWeight: 0.5,
  rrfK: 60,
} as const;

export const SEARCH_TEST_CONSTRAINTS = {
  overSampleCount: { min: 10, max: 50 },
  minThreshold: { min: 0, max: 1, step: 0.05 },
  maxResults: { min: 1, max: 50 },
  minResults: { min: 1, max: 20 },
  ftsWeight: { min: 0, max: 1, step: 0.1 },
  vectorWeight: { min: 0, max: 1, step: 0.1 },
  rrfK: { min: 1, max: 200 },
} as const;

export const searchTestSchema = z.object({
  query: z.string().min(1, "검색어를 입력해주세요"),
  overSampleCount: z
    .number()
    .min(SEARCH_TEST_CONSTRAINTS.overSampleCount.min)
    .max(SEARCH_TEST_CONSTRAINTS.overSampleCount.max),
  minThreshold: z
    .number()
    .min(SEARCH_TEST_CONSTRAINTS.minThreshold.min)
    .max(SEARCH_TEST_CONSTRAINTS.minThreshold.max),
  maxResults: z
    .number()
    .min(SEARCH_TEST_CONSTRAINTS.maxResults.min)
    .max(SEARCH_TEST_CONSTRAINTS.maxResults.max),
  minResults: z
    .number()
    .min(SEARCH_TEST_CONSTRAINTS.minResults.min)
    .max(SEARCH_TEST_CONSTRAINTS.minResults.max),
  ftsWeight: z
    .number()
    .min(SEARCH_TEST_CONSTRAINTS.ftsWeight.min)
    .max(SEARCH_TEST_CONSTRAINTS.ftsWeight.max),
  vectorWeight: z
    .number()
    .min(SEARCH_TEST_CONSTRAINTS.vectorWeight.min)
    .max(SEARCH_TEST_CONSTRAINTS.vectorWeight.max),
  rrfK: z
    .number()
    .min(SEARCH_TEST_CONSTRAINTS.rrfK.min)
    .max(SEARCH_TEST_CONSTRAINTS.rrfK.max),
});

export type SearchTestFormData = z.infer<typeof searchTestSchema>;