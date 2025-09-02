"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminPostsParams,
  FilterType,
  SortByType,
  SortOrderType,
} from "@/types/admin";

interface AdminFiltersProps {
  params: AdminPostsParams;
  onParamsChange: (newParams: Partial<AdminPostsParams>) => void;
}

export default function AdminFilters({
  params,
  onParamsChange,
}: AdminFiltersProps) {
  const filterOptions = [
    { value: "public_only", label: "공개" },
    { value: "private_only", label: "비공개" },
    { value: "with_summary", label: "AI요약 있음" },
    { value: "without_summary", label: "AI요약 없음" },
    { value: "less_than_10_recommendations", label: "추천글 10개 미만" },
  ];

  const sortOptions = [
    { value: "released_at", label: "발행일" },
    { value: "title", label: "제목" },
    { value: "created_at", label: "생성일" },
  ];

  const sortOrderOptions = [
    { value: "desc", label: "내림차순" },
    { value: "asc", label: "오름차순" },
  ];

  const handleFilterChange = (filterValue: FilterType, checked: boolean) => {
    const currentFilters = params.filter || [];
    const newFilters = checked
      ? [...currentFilters, filterValue]
      : currentFilters.filter((f) => f !== filterValue);
    onParamsChange({ filter: newFilters, page: 0 });
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            필터
          </label>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
            {filterOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`filter-${option.value}`}
                  value={option.value}
                  checked={(params.filter || []).includes(option.value as FilterType)}
                  onChange={(e) => handleFilterChange(option.value as FilterType, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800"
                />
                <label
                  htmlFor={`filter-${option.value}`}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            정렬 기준
          </label>
          <Select
            value={params.sortBy || "released_at"}
            onValueChange={(value: SortByType) =>
              onParamsChange({ sortBy: value, page: 0 })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="정렬 기준 선택" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            정렬 순서
          </label>
          <Select
            value={params.sortOrder || "desc"}
            onValueChange={(value: SortOrderType) =>
              onParamsChange({ sortOrder: value, page: 0 })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="정렬 순서 선택" />
            </SelectTrigger>
            <SelectContent>
              {sortOrderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 lg:col-span-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            검색
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="제목 검색..."
              value={params.search || ""}
              onChange={(e) =>
                onParamsChange({ search: e.target.value, page: 0 })
              }
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
