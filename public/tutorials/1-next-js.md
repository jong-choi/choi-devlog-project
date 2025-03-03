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

## 🎯 **Server Actions의 주요 장점**
[The 3 REAL benefits of Next.js Server Actions](https://www.youtube.com/watch?v=Qo_lxOI9GZU)

이 영상에서는 **Next.js의 Server Actions**가 기존 방식(`fetch()`를 사용하는 API 라우트)보다 **더 나은 이유**를 설명하고 있습니다.  
주요 내용을 요약해볼게요.  
### **1️⃣ API 라우트 없이 바로 서버에서 실행 가능**
✅ 기존에는 `fetch("/api/...")`를 사용하려면 `pages/api` 또는 `app/api` 같은 API 엔드포인트를 따로 만들어야 했음.  
✅ 하지만 **Server Actions는 API 엔드포인트 없이, 바로 서버에서 실행 가능**함.  
👉 즉, **불필요한 API 코드가 줄어들고, 더 깔끔한 코드 작성 가능!**  

---

### **2️⃣ 클라이언트 번들 크기 감소 (JS 코드 줄어듦)**
✅ `use server`를 사용하면 해당 함수가 **클라이언트 번들에 포함되지 않음**.  
✅ 즉, **클라이언트 측 코드에서 불필요한 JavaScript가 사라지고, 성능이 개선됨**.  
👉 결과적으로 **페이지 로딩 속도가 빨라지고, 초기 JS 번들이 가벼워짐**.  

---

### **3️⃣ 서버에서 직접 실행되므로 보안이 강화됨**
✅ 기존 방식(`fetch()` + API 라우트)에서는 **클라이언트에서 API URL이 노출**됨.  
✅ 하지만 **Server Actions는 클라이언트에서 직접 실행할 수 없고, 서버에서만 동작**함.  
👉 결과적으로 **API가 숨겨지고, 민감한 데이터 처리가 더 안전해짐**.  

---

### **4️⃣ 데이터베이스와 더 가까운 구조 (불필요한 네트워크 요청 감소)**
✅ 기존 방식(`fetch()` + API 라우트)에서는:  
   1. 클라이언트 → Next.js API → DB 요청  
✅ Server Actions를 사용하면:  
   1. 클라이언트 → Next.js 서버(바로 DB 연결)  
👉 **중간 API 요청이 없어지고, 네트워크 왕복 횟수가 줄어들어 더 빠름!**  

---

### **5️⃣ `useFormStatus`, `useFormState` 등과 결합하여 더 좋은 UX 제공**
✅ Server Actions는 **React의 폼 상태 관리와 자연스럽게 결합 가능**  
✅ `useFormStatus`를 사용하면, **버튼을 클릭했을 때 로딩 상태를 쉽게 표시할 수 있음**  
✅ `useFormState`를 사용하면, **서버에서 받은 응답을 바로 UI에 반영할 수 있음**  

👉 **결과적으로, 별도의 상태 관리 라이브러리 없이도 더 나은 UX를 제공 가능!**  

---

## 🎬 **영상 요약 정리**
✅ **API 라우트 없이 서버에서 직접 실행 가능** → 코드가 간결해짐  
✅ **클라이언트 번들 크기 감소** → 페이지 로딩 속도 개선  
✅ **보안 강화** → 클라이언트에서 API 노출되지 않음  
✅ **네트워크 요청 감소** → DB와 더 가까운 구조로 성능 최적화  
✅ **React의 폼 상태 관리와 자연스럽게 결합** → UX 개선  

즉, **Server Actions는 API 라우트 없이도 서버와 직접 통신할 수 있게 만들어서, 코드도 줄어들고 성능도 좋아지는 기능!** 🚀