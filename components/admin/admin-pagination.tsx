"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: AdminPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(0, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] > 0) {
      rangeWithDots.push(0);
      if (range[0] > 1) {
        rangeWithDots.push("...");
      }
    }

    rangeWithDots.push(...range);

    if (range[range.length - 1] < totalPages - 1) {
      if (range[range.length - 1] < totalPages - 2) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(totalPages - 1);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
      <div className="flex flex-1 justify-between items-center">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{startItem}</span>
          {" - "}
          <span className="font-medium">{endItem}</span>
          {" / "}
          <span className="font-medium">{totalItems}</span>
          개 결과
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>

          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={page === "..."}
                className="w-10"
              >
                {typeof page === "number" ? page + 1 : page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-1"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}