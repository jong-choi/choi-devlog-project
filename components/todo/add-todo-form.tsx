"use client";
import * as z from "zod"; // Zod 라이브러리 임포트 - 데이터 유효성 검사를 위한 라이브러리
import { zodResolver } from "@hookform/resolvers/zod"; // Zod와 react-hook-form 통합을 위한 resolver
import { useTodoModal } from "@/hooks/use-todo-modal"; // Todo 모달을 제어하는 커스텀 훅
import { Modal } from "@/components/ui/modal"; // Modal 컴포넌트 임포트
import { useForm } from "react-hook-form"; // 폼 상태를 관리하는 react-hook-form 라이브러리
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"; // Form 컴포넌트와 관련된 UI 요소들
import { Label } from "@/components/ui/label"; // 라벨 컴포넌트
import { Input } from "@/components/ui/input"; // 입력 필드 컴포넌트
import { Button } from "@/components/ui/button"; // 버튼 컴포넌트
import { useEffect } from "react"; // 리액트의 useEffect 훅
import toast from "react-hot-toast"; // 알림을 위한 라이브러리
import {
  createTodos,
  updateTodos,
} from "@/app/(example)/example/[userId]/actions"; // Todo 생성 및 수정 함수
import { useSelectedTodo } from "@/hooks/use-selected-todo"; // 선택된 Todo 관리 훅

// 폼 데이터 유효성 검사 스키마 정의 (content는 반드시 1자 이상이어야 함)
const formSchema = z.object({
  content: z.string().min(1, "Content is Required"),
});

const AddTodoForm: React.FC = () => {
  // Todo 모달 상태 제어 훅
  const todoModal = useTodoModal();

  // 선택된 Todo 상태를 관리하는 훅
  const setTodo = useSelectedTodo((state) => state.setTodo);
  const selectedTodo = useSelectedTodo((state) => state.todo);

  // react-hook-form 훅으로 폼 상태 관리
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Zod 스키마로 유효성 검사
    defaultValues: {
      content: selectedTodo?.content || "", // 초기 값 설정 (수정 모드에서 초기 데이터 활용)
    },
  });

  const { isSubmitting, isValid } = form.formState; // 폼 제출 상태와 유효성 검사 상태
  const title = selectedTodo ? "Update Todo" : "Create Todo"; // 제목 결정 (수정/생성 모드에 따라 다름)
  const description = selectedTodo
    ? "update todo with form"
    : "Create todo with form"; // 설명 결정
  const toastMessage = selectedTodo ? "Todo Updated" : "Todo Created"; // 성공 메시지
  const action = selectedTodo ? "Update" : "Create"; // 버튼 액션 (수정/생성)

  // 폼 제출 시 실행되는 함수
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedTodo) {
      // 수정 모드
      const { id } = selectedTodo;
      const { content } = values;
      await updateTodos(id, content); // Todo 수정
      todoModal.onClose(); // 모달 닫기
      setTodo(null); // 선택된 Todo 초기화
    } else {
      // 생성 모드
      const { content } = values;
      createTodos(content); // Todo 생성
      form.reset(); // 폼 리셋
      todoModal.onClose(); // 모달 닫기
    }
    toast.success(toastMessage); // 성공 알림
  };

  // 선택된 Todo 상태에 따라 폼 초기화 (수정 모드에서만 실행)
  useEffect(() => {
    if (selectedTodo === null) {
      form.setValue("content", ""); // 선택된 Todo가 없으면 content를 빈 값으로 설정
    } else if (selectedTodo !== null) {
      form.setValue("content", selectedTodo?.content); // 수정 모드일 때 초기 데이터 세팅
    }
  }, [selectedTodo, form]);

  return (
    <Modal
      isOpen={todoModal.isOpen} // 모달 열림 상태
      title={title} // 모달 제목
      description={description} // 모달 설명
      onClose={todoModal.onClose} // 모달 닫기 함수
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control} // react-hook-form의 control 객체
            name="content" // 필드 이름
            render={({ field }) => (
              <FormItem>
                <Label>Content</Label>
                <FormControl>
                  <Input placeholder="Todo Content" {...field} />
                  {/* 입력 필드 */}
                </FormControl>
                <FormMessage /> {/* 오류 메시지 표시 */}
              </FormItem>
            )}
          />
          <div className="w-full justify-end flex gap-x-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting} // 제출 중일 때 비활성화
              onClick={todoModal.onClose} // 취소 버튼 클릭 시 모달 닫기
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {/* 제출 버튼 */}
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export { AddTodoForm };
