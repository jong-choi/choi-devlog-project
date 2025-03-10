"use client";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { AlertModal } from "./alert-modal";
import { useSelectedTodo } from "@/hooks/use-selected-todo";
import { useTodoModal } from "@/hooks/use-todo-modal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Todo } from "@/types/todo";
import { Button } from "@ui/button";
import { deleteTodosSoft } from "@/app/example/[userId]/actions";

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const setTodo = useSelectedTodo((state) => state.setTodo);
  const todoModal = useTodoModal();

  const onDeleteTodo = async (todoId: number) => {
    try {
      setLoading(true);
      await deleteTodosSoft(todoId);
      toast.success("할 일이 삭제되었습니다.");
    } catch (error) {
      console.log(error);
      toast.error("오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        open={open}
        onClose={() => setOpen(false)}
        disabled={loading}
        onConfirm={() => onDeleteTodo(todo.id)}
      />
      <div className="group hover:bg-gray-100 flex gap-2 bg-white p-4 rounded-md border">
        <div>
          <h4
            className={cn(
              "text-xl font-semibold tracking-tight",
              todo.deleted_at && "line-through"
            )}
          >
            {todo.content}
          </h4>
          <div className="flex gap-4">
            <p className="font-semibold tracking-tight">작성일</p>
            <p className="font-medium tracking-tight">
              {new Date(todo.created_at!).toLocaleString("ko-KR", {
                timeZone: "Asia/Seoul",
              })}
            </p>
          </div>
        </div>
        <div className="hidden group-hover:flex gap-2 ml-auto ">
          <Button
            onClick={() => setOpen(true)}
            variant="destructive"
            size="icon"
          >
            <Trash className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              setTodo(todo);
              todoModal.onOpen();
            }}
            variant="outline"
            size="icon"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
