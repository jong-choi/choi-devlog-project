// __tests__/hooks/use-todo-modal.test.ts
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTodoModal } from "@/hooks/use-todo-modal";

describe("useTodoModal Hook을 테스트한다", () => {
  it("초기 상태는 isOpen: false", () => {
    const { result } = renderHook(() => useTodoModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("onOpen()을 호출하면 isOpen이 true가 되어야 한다", () => {
    const { result } = renderHook(() => useTodoModal());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("onClose()를 호출하면 isOpen이 false가 되어야 한다", () => {
    const { result } = renderHook(() => useTodoModal());
    act(() => {
      result.current.onOpen(); // 먼저 열기
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
