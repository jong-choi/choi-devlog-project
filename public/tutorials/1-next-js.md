Next.js 14의 App Router를 다룰 때 초보자가 알아야 할 핵심 기능들은 다음과 같아:

### 1. **파일 기반 라우팅 (File-based Routing)**
   - `app/` 디렉터리 내에서 폴더와 파일을 사용해 자동으로 라우트가 생성됨.
   - `page.tsx` → 해당 경로의 기본 페이지.
   - `layout.tsx` → 해당 폴더 내 페이지들의 공통 레이아웃.

### 2. **동적 라우팅 (Dynamic Routing)**
   - `[id]/page.tsx` → `id` 값에 따라 동적으로 라우트 생성.
   - `generateStaticParams()`를 활용한 정적 생성.

### 3. **라우트 핸들러 (Route Handlers)**
   - API 라우트를 `app/api/` 내부에서 정의.
   - `GET`, `POST` 등 HTTP 메서드를 직접 정의하는 방식.
   - 예제:
     ```ts
     export async function GET() {
       return new Response(JSON.stringify({ message: "Hello" }), { status: 200 });
     }
     ```

### 4. **서버 컴포넌트 & 클라이언트 컴포넌트**
   - 기본적으로 모든 컴포넌트는 서버 컴포넌트.
   - `"use client"`를 선언하면 클라이언트 컴포넌트로 변경.

### 5. **데이터 패칭 (Fetching Data)**
   - `fetch()`를 활용한 데이터 가져오기.
   - `cache` 옵션을 활용한 캐싱 전략 (`force-cache`, `no-store`).
   - `useEffect()`와 `useState()`를 사용한 클라이언트 사이드 데이터 패칭.

### 6. **캐싱 & Revalidation**
   - `revalidate`를 사용해 ISR(Incremental Static Regeneration) 구현 가능.
   - `force-cache`, `no-store`, `revalidatePath()` 등 활용.

### 7. **Middleware**
   - `middleware.ts`를 사용해 요청을 가로채서 처리.
   - 인증, 리다이렉션 등에 활용.

### 8. **SEO & 메타데이터**
   - `metadata` 객체를 사용해 SEO 최적화.
   - 예제:
     ```tsx
     export const metadata = {
       title: "My Page",
       description: "This is a description of my page",
     };
     ```

이 정도면 초보자를 위한 기본적인 튜토리얼 구성이 될 것 같은데, 추가하고 싶은 부분 있어? 😊


### ✅ **Next.js Server Actions 개념 및 사용법**  
Server Actions는 Next.js 14에서 도입된 기능으로, **서버에서 실행되는 함수**를 클라이언트에서 직접 호출할 수 있습니다.  
즉, **API Route(혹은 Route Handlers)를 따로 만들 필요 없이** 서버에서 실행할 수 있는 액션을 정의할 수 있습니다.

---

## 🎯 **Server Actions 사용 예시**
```tsx
"use server";

import { revalidatePath } from "next/cache";

export async function addTodo(todo: string) {
  // 서버에서 실행되는 로직
  const supabase = createClient();
  const { data, error } = await supabase
    .from("todos")
    .insert([{ text: todo, completed: false }]);

  if (error) {
    throw new Error(error.message);
  }

  // 클라이언트에서 데이터 다시 불러오기 (CSR 환경에서는 사용 안 해도 됨)
  revalidatePath("/");
}
```
### 💡 **설명**
- `"use server";`: 해당 함수가 서버에서 실행된다는 것을 명시.
- `revalidatePath("/")`: 특정 경로를 다시 불러와 최신 데이터 유지.
- `supabase.from("todos").insert()`: Supabase를 활용한 데이터 추가.

---

## 🎯 **Client Component에서 사용하기**
```tsx
"use client";

import { useState } from "react";
import { addTodo } from "./actions"; // 위에서 만든 Server Action import

export default function TodoForm() {
  const [todo, setTodo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTodo(todo); // 서버 액션 실행
    setTodo(""); // 입력값 초기화
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
        placeholder="새로운 할 일 입력"
      />
      <button type="submit">추가</button>
    </form>
  );
}
```
### 💡 **설명**
- `useState`를 사용하여 입력값 관리.
- `addTodo(todo)`를 호출하면 자동으로 **서버에서 실행**됨.
- API Route 없이 클라이언트에서 직접 **서버 액션 실행 가능**.

---

## 🎯 **Server Component에서 사용하기**
Server Component에서는 별도로 `use server`를 선언하지 않고 바로 사용할 수 있습니다.

```tsx
import { addTodo } from "./actions";

export default function AddTodoButton() {
  return (
    <form action={addTodo}>
      <input type="text" name="todo" placeholder="할 일 입력" />
      <button type="submit">추가</button>
    </form>
  );
}
```
### 💡 **설명**
- `<form action={addTodo}>`: 폼이 제출되면 **서버 액션 실행**.
- `name="todo"`를 통해 자동으로 `addTodo`의 매개변수로 전달됨.

---

## 🆚 **Server Actions vs Route Handlers**
| 비교 항목          | Server Actions               | Route Handlers (API Routes)        |
| ------------------ | ---------------------------- | ---------------------------------- |
| 사용 위치          | Server & Client Components   | `app/api/` 폴더 내 API 엔드포인트  |
| API 호출 필요 여부 | ❌ (직접 실행)                | ✅ (fetch 요청 필요)                |
| 자동 리렌더링      | ✅ (`revalidatePath`) 지원    | ❌ (수동 처리 필요)                 |
| 사용 예시          | 데이터 삽입, 삭제, 상태 변경 | REST API, 인증, 3rd-party API 호출 |

---

## ✅ **결론**
- **Server Actions는 `Server Component`, `Client Component` 어디서든 사용 가능**.
- **API Routes 없이 직접 서버에서 실행** → API 호출을 줄여 퍼포먼스 최적화.
- `use server`를 선언하여 **서버에서만 실행되도록 보장**.

👉 기존 API Route(`app/api/`)보다 **더 간단한 데이터 처리**를 원한다면 Server Actions 사용 추천! 🚀