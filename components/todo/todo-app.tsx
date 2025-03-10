import { AddTodoForm } from "@/components/todo/add-todo-form";
import { TodoClient } from "@/components/todo/todo-client";
import { TodoList } from "@/components/todo/todo-list";

export const TodoApp = () => {
  return (
    <div className="space-y-4">
      <TodoClient />
      <AddTodoForm />
      <TodoList />
    </div>
  );
};
