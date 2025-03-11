## 테스트의 종류

### 1. **단위 테스트 (Unit Test)**

📌 **가장 작은 단위(함수, 모듈, 컴포넌트 등)를 독립적으로 테스트**하는 것

- 보통 하나의 함수나 클래스, 컴포넌트가 올바르게 동작하는지 검증
- 외부 의존성을 제거하고(mocking) 개별적으로 실행
- 실행 속도가 빠르고, 코드 변경 시 빠르게 검증 가능

✅ **예제 (Jest & React Testing Library)**

```tsx
import { sum } from "./math";

test("sum 함수는 두 숫자의 합을 반환한다", () => {
  expect(sum(2, 3)).toBe(5);
});
```

```tsx
import { render, screen } from "@testing-library/react";
import Button from "./Button";

test("버튼이 올바르게 렌더링된다", () => {
  render(<Button label="클릭" />);
  expect(screen.getByText("클릭")).toBeInTheDocument();
});
```

---

### 2. **통합 테스트 (Integration Test)**

📌 **여러 모듈이 함께 작동하는지 검증**하는 것

- API 요청, 데이터베이스 연결 등 여러 개의 기능이 함께 동작할 때 문제 없는지 확인
- 보통 단위 테스트보다 실행 속도가 느림

✅ **예제 (Jest + Supabase 클라이언트 테스트)**

```tsx
import { createClient } from "@supabase/supabase-js";

test("Supabase에서 유저 데이터를 가져온다", async () => {
  const supabase = createClient("your_url", "your_key");
  const { data, error } = await supabase.from("users").select();

  expect(error).toBeNull();
  expect(data).toBeInstanceOf(Array);
});
```

---

### 3. **컴포넌트 테스트 (Component Test)**

📌 **React/Vue 등에서 개별 UI 컴포넌트가 정상적으로 렌더링되고 동작하는지 테스트**

- 단위 테스트의 일종이지만, 주로 UI 단의 컴포넌트를 다룸
- 상태 변경, 이벤트 핸들링 등을 확인

✅ **예제 (React Testing Library)**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter";

test("버튼 클릭 시 카운트 증가", () => {
  render(<Counter />);
  const button = screen.getByText("증가");
  fireEvent.click(button);
  expect(screen.getByText("1")).toBeInTheDocument();
});
```

---

### 4. **E2E 테스트 (End-to-End Test, 통합적인 사용자 테스트)**

📌 **사용자가 애플리케이션을 처음부터 끝까지 실제로 사용하는 흐름을 테스트**

- 전체 시스템을 테스트하여 기능이 예상대로 동작하는지 확인
- 보통 Cypress, Playwright, Selenium 등을 사용
- 실행 속도가 가장 느림 (실제 브라우저에서 실행되기 때문)

✅ **예제 (Cypress)**

```tsx
describe("로그인 테스트", () => {
  it("사용자가 올바르게 로그인할 수 있어야 한다", () => {
    cy.visit("/login");
    cy.get("input[name='email']").type("user@example.com");
    cy.get("input[name='password']").type("password123");
    cy.get("button[type='submit']").click();
    cy.contains("로그인 성공").should("be.visible");
  });
});
```

---

### **비교 정리**

| 테스트 종류         | 무엇을 테스트?                        | 속도 | 주요 도구                   |
| ------------------- | ------------------------------------- | ---- | --------------------------- |
| **단위 테스트**     | 개별 함수, 모듈, 컴포넌트             | 빠름 | Jest, React Testing Library |
| **통합 테스트**     | 여러 모듈이 함께 동작하는지           | 중간 | Jest, Supertest             |
| **컴포넌트 테스트** | UI 컴포넌트 단위에서 상태/이벤트 확인 | 중간 | React Testing Library       |
| **E2E 테스트**      | 실제 사용자 흐름 전체                 | 느림 | Cypress, Playwright         |

---

### **언제 어떤 테스트를 해야 할까?**

- **단위 테스트** → 빠르고 독립적인 검증이 필요할 때
- **통합 테스트** → 여러 기능이 결합될 때 문제가 없는지 확인할 때
- **컴포넌트 테스트** → UI 요소의 상태, 이벤트 등이 올바르게 동작하는지 확인할 때
- **E2E 테스트** → 사용자의 실제 흐름을 전체적으로 검증할 때

👉 **이 모든 테스트를 적절히 조합해야 신뢰할 수 있는 애플리케이션을 만들 수 있음!**

## 개발 실무 및 테스트

### **실무에서 많이 쓰는 테스트 전략**

#### 📌 **1. 테스트 피라미드 (Test Pyramid)**

테스트를 효율적으로 적용하는 가장 유명한 모델

```
    ▲  E2E 테스트  (적게, ex: Cypress, Playwright)
   ▲▲  통합 테스트 (중간, ex: Jest, Supertest)
  ▲▲▲  단위 테스트 (많이, ex: Jest, Vitest)
```

✅ 단위 테스트는 빠르고 많이 실행  
✅ 통합 테스트는 주요 흐름을 검증  
✅ E2E 테스트는 핵심 사용자 플로우만 테스트

---

#### 📌 **2. 실무에서 많이 쓰는 테스트 비율**

**🛠️ 일반적인 백엔드 서비스**

- **단위 테스트 (60~70%)** → 비즈니스 로직 검증 (ex: 함수, API 핸들러)
- **통합 테스트 (20~30%)** → DB, API 간 연동 검증
- **E2E 테스트 (5~10%)** → 사용자 시나리오 검증

**🖥️ 프론트엔드 서비스 (React, Next.js)**

- **컴포넌트 테스트 (40~50%)** → UI 단위 테스트 (ex: React Testing Library)
- **단위 테스트 (30~40%)** → 함수, 유틸리티 검증
- **E2E 테스트 (10~20%)** → 주요 사용자 플로우 검증

---

### **실무에서 테스트 전략 짜는 방법**

1️⃣ **핵심 비즈니스 로직을 먼저 테스트한다.**

- 예: 결제, 인증, 데이터 처리 등 중요한 기능은 단위 테스트 필수  
  2️⃣ **단위 테스트를 최우선으로 많이 작성한다.**
- 비용이 낮고 빠르기 때문  
  3️⃣ **통합 테스트는 필요한 부분에만 작성한다.**
- API, DB 연동 등 주요 흐름만 테스트  
  4️⃣ **E2E 테스트는 최소한으로 적용한다.**
- 브라우저 자동화 비용이 크므로, **"결제 프로세스" 같은 핵심 시나리오만 테스트**  
  5️⃣ **프론트엔드라면 컴포넌트 테스트도 고려한다.**
- Next.js, React의 UI 검증이 필요하면 Testing Library 활용

---

### **실무 예제: Next.js + Supabase 테스트 전략**

📌 **너가 진행 중인 Next.js + Supabase 프로젝트에 적용 가능함**

✅ **1. 단위 테스트 (Jest / Vitest) → 많이 작성**

- `server/actions/` 내부의 API 로직을 단위 테스트
- 비즈니스 로직 (`utils/`)을 단위 테스트

✅ **2. 통합 테스트 (Jest + Supabase Test DB) → 중간 수준**

- Supabase와의 실제 연동이 필요한 경우, **테스트용 DB를 활용**해서 API 테스트

✅ **3. 컴포넌트 테스트 (React Testing Library) → 프론트엔드가 중요하다면 작성**

- React 컴포넌트가 제대로 렌더링되는지 확인

✅ **4. E2E 테스트 (Playwright or Cypress) → 최소한으로 작성**

- 로그인, 회원가입, 주요 CRUD 플로우만 자동화

---

### **결론: 실무에서는 어떻게 테스트할까?**

1️⃣ **단위 테스트를 최우선**으로 작성 (빠르고 비용이 낮음)  
2️⃣ **통합 테스트는 주요 API & DB 연동만 작성** (필요한 만큼만)  
3️⃣ **E2E 테스트는 중요한 시나리오만 적용** (비용이 크므로 최소화)  
4️⃣ **프론트엔드라면 컴포넌트 테스트도 고려**

🔥 **즉, 실무에서는 "비용 대비 효과"를 고려해서 테스트를 선택적으로 적용함!**

## Next js + Vitest + Playwright

Vitest는 Jest에 대안으로 빠른 속도 및 vite와의 통합을 보여준다.  
Vitest를 이용하면 서버 컴포넌트와 클라이언트 컴포넌트의 유닛 테스트는 가능하지만, 비동기(async)로 작동되는 서버 컴포넌트는 지원하지 않는다.

비동기로 작동되는 서버 컴포넌트를 테스트하기 위해서는 E2E 테스트를 진행해야 한다.

Playwright는 Cypress의 대안으로 마이크로소프트에서 개발하였다. 주요 차이점은 Cypress는 JQuery를 Selector로 사용하는 반면, Playwright는 Dom API를 사용한다.  
Selector와 관련된 부분 외에도 코드베이스에서 차이가 있는데, 비동기 처리를 할 때에도 Playwright는 async/await 방식을 사용하여 보다 최신 프레임워크들에 부합한다.

### 세팅

#### Vitest

[Setting up Vitest with Next.js - Next.JS Docs](https://nextjs.org/docs/app/building-your-application/testing/vitest)

- vitest 설치  
  `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`

- 루트 폴더에 `vitest.config.mts` 생성

```ts
import { defineConfig } from "vitest/config"; // Vitest에서 설정을 정의하는 함수.
import react from "@vitejs/plugin-react"; // Vite에서 React를 사용할 수 있도록 해주는 플러그인.
import tsconfigPaths from "vite-tsconfig-paths"; // tsconfig.json의 paths 옵션을 지원하도록 해주는 플러그인.

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    /*
     * 테스트 환경을 jsdom으로 설정
     * jsdom은 브라우저 환경을 흉내 내는 가상 DOM 라이브러리
     * React 컴포넌트 테스트 시 DOM API를 사용할 수 있도록 함
     */
  },
});
```

- 추가로 jsdom 환경에서 env 파일을 불러오기 위해서는 dotenv라는 라이브러리를 함께 실행해주는 것이 좋다.
  `npm install dotenv --save-dev`

```ts
import { defineConfig } from "vitest/config"; // Vitest에서 설정을 정의하는 함수.
import react from "@vitejs/plugin-react"; // Vite에서 React를 사용할 수 있도록 해주는 플러그인.
import tsconfigPaths from "vite-tsconfig-paths"; // tsconfig.json의 paths 옵션을 지원하도록 해주는 플러그인.

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    /*
     * 테스트 환경을 jsdom으로 설정
     * jsdom은 브라우저 환경을 흉내 내는 가상 DOM 라이브러리
     * React 컴포넌트 테스트 시 DOM API를 사용할 수 있도록 함
     */
    setupFiles: ["dotenv/config"],
    /*
     * setupFiles 목록에 dotenv/config를 추가한다.
     * dotenv.config()는 .env파일을 읽고 process.env에 등록하는 역할을 한다.
     * 결과적으로 .env 파일들이 jsdom에 등록된다.
     */
  },
});
```

#### Playwright

[Setting up Vitest with Next.js - Next.JS Docs](https://nextjs.org/docs/app/building-your-application/testing/vitest)

- vitest 설치  
  `npm init playwright` 혹은 `yarn create playwright`

- 루트 폴더에 `vitest.config.mts` 생성

```ts
import { defineConfig } from "vitest/config"; // Vitest에서 설정을 정의하는 함수.
import react from "@vitejs/plugin-react"; // Vite에서 React를 사용할 수 있도록 해주는 플러그인.
import tsconfigPaths from "vite-tsconfig-paths"; // tsconfig.json의 paths 옵션을 지원하도록 해주는 플러그인.

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    /*
     * 테스트 환경을 jsdom으로 설정
     * jsdom은 브라우저 환경을 흉내 내는 가상 DOM 라이브러리
     * React 컴포넌트 테스트 시 DOM API를 사용할 수 있도록 함
     */
  },
});
```

[Setting up Playwright with Next.js - Next.JS Docs](https://nextjs.org/docs/app/building-your-application/testing/playwright)

## **테스트 전략**

1. **단위 테스트(Unit Test)**

   - `Zustand` 상태 관리 훅 테스트
   - `useTodoModal`, `useSelectedTodo` 훅 동작 검증
   - `createTodos`, `updateTodos`, `deleteTodosSoft` 등의 Server Action 함수 검증 (DB 없이)
   - `ToastProvider`와 같은 UI 관련 기능 테스트

2. **통합 테스트(Integration Test)**

   - `AddTodoForm`이 `onSubmit` 시 `createTodos` 또는 `updateTodos`를 올바르게 호출하는지 확인
   - `TodoList`가 `getTodosByUserId`를 호출하고 올바르게 데이터를 표시하는지 테스트

3. **컴포넌트 테스트(Component Test)**

   - `Modal`, `TodoList`, `TodoItem` 등의 UI 동작 검증

4. **E2E 테스트(End-to-End Test)**
   - **Cypress**나 **Playwright**를 사용해 실제 유저의 행동을 시뮬레이션

---

# **1️⃣ 단위 테스트 - Zustand 훅**

훅을 테스트 할 때에는 `@testing-library/react`의 `act`와 `renderHook`이 사용된다.

1. `act` : 리액트의 상태 업데이트 및 비동기 작업을 수행할 때에 사용되는 함수이다. 본 테스트에서는 act에 상태변경 함수를 넣어 상태가 변경될 때까지 기다리도록 하는 역할을 한다.
2. `renderHook` : 별도의 렌더링 환경에서 훅을 실행하고, 이를 실행한 결과값을 result로 반환받아 접근할 수 있도록 한다. 리액트의 Hooks가 작동하기 위해서는 별도의 실행 컨텍스트가 필요하고, 이를 렌더링하기 위해 필요한 함수이다.

zustand로 만든 use-todo-modal 훅을 테스트 하기 위해 3개의 테스트를 작성한다.

1. 초기 상태가 false인지
2. onOpen Setter를 실행하면 상태가 true가 되는지
3. onOpen Setter를 실행한 후, onClose Setter를 실행하면 상태가 false가 되는지

```tsx
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
```

### ✅ **설명**

- `renderHook()`을 사용해 훅을 테스트한다.
- `onOpen()` / `onClose()`가 `isOpen` 값을 올바르게 변경하는지 확인.

---

# **2️⃣ 단위 테스트 - Server Action 모킹(Mock)**

## Server Action을 테스트 하는 예시

### "next/headers"의 cookies 모킹

vi.mock은 특정 모듈을 가짜(mock)로 대체할 때 사용한다.

```tsx
vi.mock("모듈명", () => ({
  함수이름: vi.fn(() => "반환값"),
}));
```

next js의

```tsx
// __test__/actions/todo-actions.test.ts
import { createClient } from "@/utils/supabase/server";
import { describe, expect, it, vi } from "vitest";

// cookies 모킹
vi.mock("next/headers", () => ({
  cookies: () => ({
    getAll: vi.fn().mockReturnValue([{ name: "session", value: "test" }]),
    set: vi.fn(),
    setAll: vi.fn(),
  }),
}));

describe("createClient", () => {
  it("should create a supabase client with mock cookies", async () => {
    const client = await createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });
});
```

---

# **3️⃣ 컴포넌트 테스트 - AddTodoForm**

```tsx
// __tests__/components/add-todo-form.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { AddTodoForm } from "@/components/todo/add-todo-form";
import { useTodoModal } from "@/hooks/use-todo-modal";
import { createTodos } from "@/app/example/[userId]/actions";

jest.mock("@/hooks/use-todo-modal", () => ({
  useTodoModal: jest.fn(() => ({ isOpen: true, onClose: jest.fn() })),
}));

jest.mock("@/app/example/[userId]/actions", () => ({
  createTodos: jest.fn(),
}));

describe("AddTodoForm Component", () => {
  it("입력 필드와 버튼이 렌더링되어야 한다", () => {
    render(<AddTodoForm />);
    expect(screen.getByPlaceholderText("Todo Content")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("폼을 제출하면 createTodos가 호출되어야 한다", async () => {
    render(<AddTodoForm />);
    const input = screen.getByPlaceholderText("Todo Content");
    const button = screen.getByText("Create");

    fireEvent.change(input, { target: { value: "New Todo" } });
    fireEvent.click(button);

    expect(createTodos).toHaveBeenCalledWith("New Todo");
  });
});
```

### ✅ **설명**

- `useTodoModal`을 모킹해 모달이 열려 있는 상태를 유지.
- `createTodos`가 폼 제출 시 정상적으로 호출되는지 확인.

---

# **4️⃣ 통합 테스트 - TodoList**

```tsx
// __tests__/components/todo-list.test.tsx
import { render, screen } from "@testing-library/react";
import { TodoList } from "@/components/todo/todo-list";
import { getTodosByUserId } from "@/app/example/[userId]/actions";

jest.mock("@/app/example/[userId]/actions", () => ({
  getTodosByUserId: jest.fn(() => [
    { id: 1, content: "First Todo" },
    { id: 2, content: "Second Todo" },
  ]),
}));

describe("TodoList Component", () => {
  it("Todos가 올바르게 렌더링되어야 한다", async () => {
    render(<TodoList />);
    expect(await screen.findByText("First Todo")).toBeInTheDocument();
    expect(await screen.findByText("Second Todo")).toBeInTheDocument();
  });
});
```

### ✅ **설명**

- `getTodosByUserId`를 모킹하여 **DB 없이** `TodoList`가 올바르게 렌더링되는지 확인.

---

# **5️⃣ E2E 테스트 (Cypress)**

```js
// cypress/e2e/todo.cy.js
describe("Todo App", () => {
  it("새로운 Todo를 추가할 수 있어야 한다", () => {
    cy.visit("/todo");
    cy.contains("Create").click();
    cy.get('input[placeholder="Todo Content"]').type("New Todo");
    cy.contains("Create").click();
    cy.contains("New Todo").should("exist");
  });

  it("Todo를 삭제할 수 있어야 한다", () => {
    cy.contains("New Todo")
      .parent()
      .find("button[aria-label='Delete']")
      .click();
    cy.contains("New Todo").should("not.exist");
  });
});
```

### ✅ **설명**

- 실제 유저가 `Todo`를 추가하고 삭제할 수 있는지 **브라우저 환경에서 직접 테스트**.

---

## **결론**

- **단위 테스트**로 개별 기능을 검증.
- **통합 테스트**로 여러 함수가 함께 작동하는지 확인.
- **컴포넌트 테스트**로 UI가 정상적으로 렌더링되는지 검증.
- **E2E 테스트**로 실제 유저의 흐름을 시뮬레이션.

이제 이 테스트 코드들을 실행하면서 앱이 안정적으로 동작하는지 검증하면 된다. 🚀

---

E2E 방식으로 작성해야할듯.

```tsx
import { test, expect } from "@playwright/test";

// 테스트에 사용할 유저 정보 (환경변수에서 불러오기)
const TEST_EMAIL = process.env.TEST_USER_EMAIL!;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe("Todo App E2E", () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto("/login");

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click("button:has-text('Login')");

    // 로그인 후 Todo 페이지로 이동
    await page.waitForURL("/todo");
  });

  test("✅ Todo 리스트 조회", async ({ page }) => {
    // Todo 목록이 정상적으로 로드되는지 확인
    await expect(page.locator(".todo-item")).toHaveCountGreaterThan(0);
  });

  test("✅ 새로운 Todo 추가", async ({ page }) => {
    // 새로운 Todo 생성
    await page.fill('input[placeholder="Todo Content"]', "New Todo");
    await page.click("button:has-text('Create')");

    // 생성된 Todo가 목록에 존재하는지 확인
    await expect(page.locator(".todo-item")).toContainText("New Todo");
  });

  test("✅ Todo 수정", async ({ page }) => {
    // 기존 Todo 중 첫 번째 아이템 수정
    const firstTodo = page.locator(".todo-item").first();
    await firstTodo.click();

    await page.fill('input[placeholder="Edit Content"]', "Updated Todo");
    await page.click("button:has-text('Save')");

    // 수정된 내용 확인
    await expect(firstTodo).toContainText("Updated Todo");
  });

  test("✅ Todo 삭제", async ({ page }) => {
    // 기존 Todo 중 첫 번째 아이템 삭제
    const firstTodo = page.locator(".todo-item").first();
    await firstTodo.locator("button:has-text('Delete')").click();

    // 삭제 확인
    await expect(firstTodo).not.toBeVisible();
  });

  test("✅ 로그아웃", async ({ page }) => {
    // 로그아웃 버튼 클릭
    await page.click("button:has-text('Logout')");

    // 로그인 페이지로 이동했는지 확인
    await expect(page).toHaveURL("/login");
  });
});
```
