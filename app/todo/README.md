# TODO APP 화면 구현하기

[Intermediate Todo App With Next.js 14](https://fatihbirtil.com.tr/blog/intermediate-todo-app-with-nextjs-14)

[참고 - use client를 사용해도 SSG 로 캐싱된다.] (https://github.com/vercel/next.js/discussions/65442)

## 미들웨어 설정

/todo 페이지도 로그인을 해야 들어올 수 있도록 미들웨어를 설정한다.

```tsx
// example에 접근하지 못하게 하는 샘플코드
// if (request.nextUrl.pathname.startsWith("/example") && user.error) {
//   return NextResponse.redirect(new URL("/auth/login", request.url));
// }

// restrictedPaths에 포함된 경로들에 접근하지 못하도록 하는 코드
const restrictedPaths = ["/example", "/todo"];
const isRestricted = restrictedPaths.some((path) =>
  request.nextUrl.pathname.startsWith(path)
);

if (isRestricted && user.error) {
  return NextResponse.redirect(new URL("/auth/login", request.url));
}
```

## 필요 라이브러리 설치

```zsh
npm install zustand react-hot-toast
npx shadcn-ui@latest add button input form dialog
```

### Toast Provider

전역적으로 토스트 메시지를 표시하기 위해 `react-hot-toast` 라이브러리를 활용할 수 있다.  
아래 코드는 `ToastProvider` 컴포넌트를 생성하여 애플리케이션 전반에서 토스트 기능을 사용할 수 있도록 설정하는 방법을 설명한다.

---

### 1. `ToastProvider` 생성

```tsx
// providers/toast-provider.tsx

"use client"; // 해당 컴포넌트가 클라이언트 환경에서만 실행되도록 지정
import { Toaster } from "react-hot-toast";

// 애플리케이션 전역에서 토스트 알림을 사용할 수 있도록 하는 Provider 컴포넌트
export const ToastProvider = () => {
  return <Toaster />;
};
```

이 `ToastProvider`는 `react-hot-toast`의 `Toaster` 컴포넌트를 감싸는 역할을 하며,  
이를 루트 레이아웃에 추가하면 애플리케이션 내 모든 페이지에서 토스트 알림을 사용할 수 있다.

---

### 2. `TodoLayout`에 `ToastProvider` 추가

```tsx
// app/todo/layout.tsx

import { ToastProvider } from "@/providers/toast-provider";

export default function TodoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 전역적으로 토스트 알림을 사용할 수 있도록 설정 */}
      <ToastProvider />
      <section>{children}</section>
    </>
  );
}
```

`TodoLayout` 내부에서 `ToastProvider`를 추가하면,  
`app/todo` 경로 아래의 모든 페이지에서 `toast.success()`, `toast.error()` 등의 함수를 호출하여  
토스트 메시지를 띄울 수 있다.

---

이제 `import { toast } from "react-hot-toast";`를 통해 `toast("메시지")`를 실행하면,  
화면에 토스트 메시지가 표시된다.  
추가적으로 `Toaster`에 `position`, `duration` 등의 옵션을 설정하여 스타일을 커스터마이징할 수도 있다.

### types

```ts
// types/todo.ts
import { Database } from "./supabase";

export type Todo = Pick<
  Database["public"]["Tables"]["todos_with_rls"]["Row"],
  "content" | "created_at" | "id" | "updated_at" | "user_id"
>;
```

위의 타입은 아래와 같이 변환된다.

```ts
type Todo = {
  content: string;
  created_at: string | null;
  id: number;
  updated_at: string | null;
  user_id: string | null;
};
```

### Modal UI 만들기

`components/ui/modal.tsx`

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children,
}) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export { Modal };
```

### useTodoModal 훅

```tsx
// hooks/use-todo-modal.tsx
import { create } from "zustand";

interface useTodoModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useTodoModal = create<useTodoModalProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
```

**Zustand**를 이용해 `useTodoModal` 훅을 구현한다. 이 훅은 `isOpen` 상태와 해당 상태를 변경하는 `onOpen`, `onClose` 함수를 제공한다.

- `isOpen`: 모달의 열림/닫힘 상태를 나타내며, 기본값은 `false`로 설정되어 있다.
- `onOpen`: 모달을 열기 위한 함수로, 상태를 `true`로 변경한다.
- `onClose`: 모달을 닫기 위한 함수로, 상태를 `false`로 변경한다.

이 훅은 **전역 상태**로 관리되므로, props를 통해 모달 상태를 전달하지 않고, 필요한 곳에서 이 훅을 사용하여 모달의 상태를 제어할 수 있다. 이를 통해 **props drilling**을 방지하고, 코드의 가독성 및 유지보수성을 향상시킬 수 있다.

### Use Selected Todo

클라이언트에서 Todo를 선택하여 수정, 삭제, 편집 등을 행할 때 사용할 수 있도록 zustand 상태를 추가한다.

```tsx
// hooks/use-selected-todo.tsx
import { Todo } from "@/types/todo";
import { create } from "zustand";

interface useSelectedTodoProps {
  todo: Todo | null;
  setTodo: (todo: Todo | null) => void;
}

export const useSelectedTodo = create<useSelectedTodoProps>((set) => ({
  todo: null,
  setTodo: (todo: Todo | null) => set({ todo }),
}));
```

## Server Action 수정

`app/example/[userId]/actions.tsx`에 필요한 내용을 추가한다.

```tsx
export const createRevalidationTagFactory = async ({
  userId,
}: {
  userId?: string;
}) => ({
  get todoListByUserId() {
    return `todoList:userId:${userId}`;
  },
});

export const revalidateTodoListByUserId = async (supabase: SupabaseClient) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const tagFactory = await createRevalidationTagFactory({ userId });
  const tag = tagFactory.todoListByUserId;
  revalidateTag(tag);
};
```

`createRevalidationTagFactory` 함수로 revalidation 태그들을 관리하는 factory를 반환하도록 하였다. 해당 함수는 async 함수로 작동하여 Server Action으로 분류되며, 반환된 팩토리에서는 getter를 이용하여 원하는 revalidation 태그를 반환받을 수 있다. 이러한 방식을 사용하면 revalidation 태그를 관리하는 로직이 서버사이드에 남아있게 된다.  
`revalidateTodoListByUserId`는 supabase client를 인자로 넘겨주면 이를 이용해 자동으로 userId로 캐싱한 태그를 ravalidate하는 서버 액션이다.

```tsx
// todoList 가져오기 + by UserId
export const getTodosByUserId = async (
  userId: string,
  cookieStore?: ReadonlyRequestCookies
): Promise<Array<
  Database["public"]["Tables"]["todos_with_rls"]["Row"]
> | null> => {
  const supabase = await createClient(cookieStore);
  const result = await supabase
    .from("todos_with_rls")
    .select("*")
    .is("deleted_at", null)
    .eq("user_id", userId)
    .order("created_at", { ascending: false }); // 최신 글이 배열 가장 앞에 오도록 정렬

  return result.data;
};
```

```tsx
// todoList 생성하기
export const createTodos = async (
  content: string
): Promise<Array<
  Database["public"]["Tables"]["todos_with_rls"]["Insert"]
> | null> => {
  const supabase = await createClient();

  const result = await supabase
    .from("todos_with_rls")
    .insert({
      content,
    })
    .select();

  await revalidateTodoListByUserId(supabase);
  return result.data;
};
```

todo list 불러오기와 todo 생성하기는 위와 같이 Database를 이용해서 타입을 지정해줬다. "insert"와 "select"에 따른 타입을 명확히 하기 위함이다.

```tsx
// todoList 업데이트 하기
export const updateTodos = async (id: number, content: string) => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  await revalidateTodoListByUserId(supabase);

  return result.data;
};

// todoList softDelete
export const deleteTodosSoft = async (id: number) => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();
  await revalidateTodoListByUserId(supabase);
  return result.data;
};
```

todoList를 생성 및 업데이트 하는 함수에 앞서 만든 revalidateTodoListByUserId를 추가해주었다.

## Todo Create Form

```tsx
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
import { createTodos, updateTodos } from "@/app/example/[userId]/actions"; // Todo 생성 및 수정 함수
import { revalidatePath } from "next/cache"; // Next.js 페이지 리프레시 함수
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
```

이 코드는 Todo 항목을 생성하거나 수정하는 폼을 제공하는 컴포넌트이다. 주요 흐름은 다음과 같다:

1. **폼 데이터 관리**: `useForm`을 사용해 폼 상태를 관리하고, Zod로 유효성 검사를 한다. `content` 필드는 최소 1자 이상의 문자열이어야 한다.

2. **초기 데이터 처리**: `selectedTodo`가 있으면 수정 모드로, 그렇지 않으면 생성 모드로 동작한다. `useSelectedTodo` 훅을 통해 선택된 Todo를 추적하고, `setTodo`를 사용해 선택된 Todo를 설정하거나 초기화한다.

3. **폼 제출**: 폼이 제출되면 `onSubmit` 함수가 실행되며, Todo 생성 또는 수정 작업을 수행한다. 수정일 경우 `updateTodos`, 새 Todo 생성 시 `createTodos`를 호출한다. 이후 성공 메시지가 표시되고 모달은 닫힌다.

4. **모달과 폼 UI**: `Modal` 컴포넌트를 사용하여 폼을 모달 안에 렌더링한다. 폼 필드에는 `Form`, `FormControl`, `Input` 등을 사용하여 사용자 입력을 받는다. 또한, `Cancel` 버튼으로 모달을 닫거나 `Create`/`Update` 버튼으로 폼을 제출할 수 있다.

#### Zod

Zod는 TypeScript에서 데이터 유효성 검사를 위한 라이브러리이다. 사용법은 간단하며, 객체 형태로 유효성 검사 스키마를 정의하고 이를 활용한다.

1. **스키마 정의**: `z.object()`를 사용해 검사할 필드와 조건을 정의한다. 예를 들어, `content` 필드는 문자열이고, 최소 1자 이상이어야 한다는 조건을 설정할 수 있다.

   ```ts
   const formSchema = z.object({
     content: z.string().min(1, "Content is Required"),
   });
   ```

2. **유효성 검사 적용**: `zodResolver`를 사용하여 Zod 스키마를 `react-hook-form`에 통합한다. 이를 통해 폼 데이터를 제출할 때 자동으로 유효성 검사가 진행된다.

   ```ts
   const form = useForm({
     resolver: zodResolver(formSchema),
   });
   ```

3. **에러 메시지 관리**: 유효성 검사에서 실패할 경우, Zod는 오류 메시지를 반환한다. 이를 통해 폼 필드에 관련 오류 메시지를 표시할 수 있다.

## Todo App

```tsx
// components/todo/todo-app.tsx

import { AddTodoForm } from "@/components/todo/add-todo-form";
import { TodoList } from "@/components/todo/todo-list";

export const TodoApp: React.FC = async () => {
  return (
    <div className="space-y-4">
      <AddTodoForm />
      <TodoList />
    </div>
  );
};
```

## Todo List

```tsx
// components/todo/todo-list.tsx

import {
  createRevalidationTagFactory,
  getTodosByUserId,
} from "@/app/example/[userId]/actions";
import { TodoItem } from "@/components/todo/todo-item";
import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";

export const TodoList: React.FC = async () => {
  // supabase 클라이언트에서 user정보를 가져온다.
  const supabase = await createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id || "";

  // 데이터를 캐싱할 때 관리할 태그명을 생성한다.
  const { todoListByUserId: cacheTag } = await createRevalidationTagFactory({
    userId,
  });

  // Server Action로 받아온 데이터를 캐싱하는 `unstable_cache` 래퍼
  const cachedFetchTodos = unstable_cache(
    getTodosByUserId,
    [cacheTag], // cache를 관리하는 고유한 key
    {
      revalidate: 10000000,
      tags: [cacheTag], // cache를 revalidate 할 때 사용하는 태그
    }
  );

  // cookies()를 외부에서 실행시켜 cookieStore로 만든 후, userId와 cookieStore를 함께 전달하여 데이터를 가져온다.
  const cookieStore = await cookies();
  const todos = await cachedFetchTodos(userId, cookieStore);

  return (
    <div className="flex flex-col gap-4 mt-10 pt-10">
      {!todos?.length ? (
        <div>할 일이 없습니다.</div>
      ) : (
        todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
      )}
    </div>
  );
};
```

## Alert Modal

삭제 버튼을 클릭하면 노출되는 Modal이다.

```tsx
// components/todo/alert-modal.tsx

import { Button } from "@ui/button";
import { Modal } from "@ui/modal";

interface AlertModalProps {
  disabled: boolean;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  disabled,
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      title="삭제하시겠습니까?"
      description="삭제 시 복구가 불가능합니다."
      isOpen={open}
      onClose={onClose}
    >
      <div className="flex items-center justify-end gap-x-2">
        <Button onClick={onClose} disabled={disabled} variant="outline">
          취소
        </Button>
        <Button onClick={onConfirm} disabled={disabled} variant="destructive">
          삭제
        </Button>
      </div>
    </Modal>
  );
};

export { AlertModal };
```

## Todo Item

Tailwind CSS의 group 클래스는 Tailwind CSS에서 제공하는 유용한 유틸리티 클래스이다. group은 부모 요소에 마우스가 올라갔을 때, 그 하위 자식 요소들이 그룹화된 방식으로 스타일을 변경하도록 만들어주는 기능을 한다.

부모 요소에 hover가 됐을 때 수정/삭제 버튼그룹이 노출되도록 한다.

한편, supabase에서 시간을 저장할 때에 UTC를 사용하고 있으니 이를 클라이언트에서 변환해줘야 한다. 본 예제에서는 간단하게 `Date.prototype.toLocaleString("ko-KR", { timeZone: "UTC" })`를 통해서 변환하였다.

```tsx
//components/todo/todo-item.tsx

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
                timeZone: "UTC",
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
```

## Todo Client

todo client 파일에서 AddTodoForm을 호출할 수 있다. useSelectedTodo의 setTodo를 통해 selectedTodo를 null로 만들어 준다.

```tsx
// components/todo/todo-client.tsx
"use client";
import { useSelectedTodo } from "@/hooks/use-selected-todo";
import { useTodoModal } from "@/hooks/use-todo-modal";
import { Button } from "@ui/button";

export const TodoClient = () => {
  const setSelectedTodo = useSelectedTodo((state) => state.setTodo);
  const todoModal = useTodoModal();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-semibold tracking-tighter">
        Todo App Next.js 14
      </h1>
      <Button
        onClick={() => {
          setSelectedTodo(null);
          todoModal.onOpen();
        }}
      >
        Add Todo
      </Button>
    </div>
  );
};
```

## Todo App

```tsx
// components/todo/todo-app.tsx

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
```

## Page

```tsx
// app/todo/page.tsx
import { TodoApp } from "@/components/todo/todo-app";

export default function Home() {
  return (
    <div className="max-w-[600px] mx-auto my-6 py-6 px-4">
      <TodoApp />
    </div>
  );
}
```

지금까지 만든 TODO APP에 대해 test-later development 방식으로 테스트 코드를 작성하며 Next.js의 TDD 에 대해 공부하고자 한다. [➡ TEST폴더 README로 이동하기](../../__test__/README.md)
