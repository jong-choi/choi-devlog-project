"use client";

import { useEffect, useRef } from "react";

interface EditableDivProps {
  value?: string;
  onInput?: (value: string) => void;
  isEditable?: boolean;
}

/**
 * 사용자가 직접 편집할 수 있는 div 요소
 */
export const EditableDiv: React.FC<EditableDivProps> = ({
  value = "",
  onInput,
  isEditable = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  /** 입력 이벤트 핸들러 */
  const handleInput = () => {
    const newValue = ref.current?.innerText || "";
    onInput?.(newValue);
  };

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
