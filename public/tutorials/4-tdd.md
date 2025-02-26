Next.js 14 App Router에서 TDD(Test-Driven Development)를 적용하는 방법을 정리하면 다음과 같아:

---

## **1. TDD란?**
   - "테스트를 먼저 작성하고, 그에 맞게 코드를 구현하는" 개발 방식.
   - **Red → Green → Refactor** 사이클을 반복.
   - Next.js의 서버 컴포넌트, 클라이언트 컴포넌트, API Route를 테스트 가능.

---

## **2. 테스트 환경 설정**
### **① Jest + React Testing Library 설치 (클라이언트 컴포넌트)**
```sh
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```
- `jest.config.js` 설정:
```js
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
};

module.exports = createJestConfig(customJestConfig);
```
- `jest.setup.js` 파일:
```js
import "@testing-library/jest-dom";
```

### **② Vitest 설치 (대체 가능)**
```sh
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```
- `vite.config.js` 설정:
```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
  },
});
```

---

## **3. 클라이언트 컴포넌트 테스트**
```tsx
// components/Button.tsx
"use client";
import React from "react";

type ButtonProps = {
  onClick: () => void;
  label: string;
};

export function Button({ onClick, label }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```
```tsx
// tests/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/Button";

test("버튼 클릭 시 이벤트 핸들러 호출", () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick} label="Click me" />);

  const button = screen.getByText("Click me");
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

## **4. 서버 컴포넌트 테스트**
- Jest에서 기본적으로 `server-only` 코드를 실행할 수 없음 → **Playwright / Cypress** 같은 e2e 테스트 필요.
- 서버 유틸리티 함수는 `vitest`에서 테스트 가능.

```ts
// lib/utils.ts
export function formatDate(date: string) {
  return new Date(date).toISOString().split("T")[0];
}
```
```ts
// tests/utils.test.ts
import { formatDate } from "@/lib/utils";

test("formatDate 함수 테스트", () => {
  expect(formatDate("2025-02-27")).toBe("2025-02-27");
});
```

---

## **5. API Route 핸들러 테스트 (`app/api/`)**
- **`supertest`**를 사용해 Next.js API Route 테스트.

```sh
npm install --save-dev supertest
```
```ts
// app/api/hello/route.ts
export async function GET() {
  return new Response(JSON.stringify({ message: "Hello, world!" }), { status: 200 });
}
```
```ts
// tests/api/hello.test.ts
import request from "supertest";
import { handler } from "@/app/api/hello/route";

test("API 응답이 올바른지 확인", async () => {
  const response = await request(handler).get("/");
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Hello, world!");
});
```

---

## **6. E2E 테스트 (Playwright)**
```sh
npx playwright install
```
- `playwright.config.ts` 설정 후 테스트 작성.

```ts
// tests/example.spec.ts
import { test, expect } from "@playwright/test";

test("홈페이지 렌더링 확인", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.locator("h1")).toContainText("Welcome");
});
```

---

이런 내용으로 튜토리얼을 구성하면 TDD를 Next.js App Router에 적용하는 방법을 잘 설명할 수 있을 거야! 추가하고 싶은 부분 있어? 😊