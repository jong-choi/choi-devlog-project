"use client";
import { useEffect, useRef } from "react";

/**
 * 사용자가 직접 편집할 수 있는 div 요소
 * @param {string} value - 초기 텍스트 값
 * @param {(value: string) => void} onInput - 입력값이 변경될 때 호출되는 콜백 함수
 * @param {boolean} isEditable - 수정 가능 여부
 */
export const EditableDiv: React.FC<{
  value?: string;
  onInput?: (value: string) => void;
  isEditable?: boolean;
}> = ({ value = "", onInput, isEditable = true }) => {
  const ref = useRef<HTMLDivElement>(null);

  /** 입력 이벤트 핸들러 */
  const handleInput = () => {
    const newValue = ref.current?.innerText || "";
    onInput?.(newValue);
  };

  /** value 변경 시 div 내용 업데이트 */
  useEffect(() => {
    if (ref.current) {
      ref.current.innerText = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable={isEditable}
      suppressContentEditableWarning
      className="h-full w-full break-words whitespace-pre-wrap focus:outline-offset-8 focus:outline-dotted"
      onInput={handleInput}
    />
  );
};
