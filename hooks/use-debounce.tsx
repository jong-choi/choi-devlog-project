import { useState, useEffect } from "react";

/**
 * 입력된 값을 지정된 `delay`(ms)만큼 지연시켜 반환하는 훅.
 * 값이 변경될 때마다 타이머를 초기화하여 일정 시간이 지나야 최종 값이 설정됨.
 *
 * @template T - 디바운스할 값의 타입
 * @param {T} value - 디바운스할 원본 값
 * @param {number} delay - 디바운스 지연 시간 (밀리초)
 * @returns {T} - 지정된 시간 후 최종적으로 설정된 값
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     console.log("API 요청:", debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 3000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
