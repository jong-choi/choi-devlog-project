This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Next js 시작

`npx create-next-app@latest`

cli가 실행되면 아래와 같이 선택한다.

```
√ What is your project named? ... .
√ Would you like to use TypeScript? ... Yes
√ Would you like to use ESLint? ... Yes
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like your code inside a `src/` directory? ... No
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to use Turbopack for `next dev`? ... Yes
√ Would you like to customize the import alias (`@/*` by default)? ... No
Creating a new Next.js app in C:\Users\bluec\Desktop\next-js-boilerplate.
```

## 스니펫 설정

file - preferences - configure snippets - typescriptreact를 선택하여 수정한다.
C:\Users\bluec\AppData\Roaming\Code\User\snippets\typescriptreact.json

tafce : 파일명을 기준으로 화살표 함수 컴포넌트를 생성한다.  
tafcew : 폴더명을 기준으로 props와 interface를 정의한 후, Next.js 15에 맞는 Page 컴포넌트를 생성한다.

```json
{
  "TSX Arrow Function Component Export": {
    "prefix": "tafce",
    "body": [
      "const ${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}: React.FC = () => {",
      "  return <div>${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}</div>;",
      "};",
      "",
      "export default ${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/};"
    ],
    "description": "TSX Arrow Function Component with File Name for TypeScript"
  },
  "TSX Arrow Function Component Export for Next.js Page (w)ith Dynamic Params": {
    "prefix": "tafcew",
    "body": [
      "interface PageProps {",
      "  params: Promise<{",
      "    ${TM_DIRECTORY/(.+[\\/\\\\])?\\[([^\\/\\\\]+)\\][\\/\\\\]*$/$2/}: string",
      "  }>;",
      "  searchParams?: Promise<Record<string, string | string[]>>;",
      "  children?: React.ReactNode;",
      "}",
      "",
      "const Page: React.FC<PageProps> = async ({ params, searchParams, children }) => {",
      "  return (",
      "    <div>",
      "      <h1>Page Component</h1>",
      "      <pre>{JSON.stringify(await params, null, 2)}</pre>",
      "      <pre>{JSON.stringify(await searchParams, null, 2)}</pre>",
      "      {children}",
      "    </div>",
      "  );",
      "};",
      "",
      "export default Page;"
    ],
    "description": "TSX Arrow Function Component with Directory Name for Next.js 15 App Router"
  },
  "TSX Function Component": {
    "prefix": "tfc",
    "body": [
      "export default function ${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}() {",
      "  return <div>${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}</div>;",
      "}"
    ],
    "description": "TSX Function Component with File Name for TypeScript"
  },
  "TSX Function Component for Next.js Page (w)ith Dynamic Params": {
    "prefix": "tfcw",
    "body": [
      "interface PageProps {",
      "  params: Promise<{",
      "    ${TM_DIRECTORY/(.+[\\/\\\\])?\\[([^\\/\\\\]+)\\][\\/\\\\]*$/$2/}: string",
      "  }>;",
      "  searchParams?: Promise<Record<string, string | string[]>>;",
      "  children?: React.ReactNode;",
      "}",
      "",
      "export default async function Page({ params, searchParams, children }: PageProps) {",
      "  return (",
      "    <div>",
      "      <h1>Page Component</h1>",
      "      <pre>{JSON.stringify(await params, null, 2)}</pre>",
      "      <pre>{JSON.stringify(await searchParams, null, 2)}</pre>",
      "      {children}",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "TSX Function Component with Directory Name for Next.js 15 App Router"
  }
}
```

### **VSCode 설정 변경으로 절대경로(`alias`) 강제 적용하기**

[Always use alias for automatic imports - Stack Overflow](https://stackoverflow.com/questions/77314336/always-use-alias-for-automatic-imports)

`tsconfig.json`(또는 `jsconfig.json`)에서 **경로 별칭(path alias)**을 올바르게 설정했다면, VSCode의 설정을 변경하여 **항상 절대경로를 사용하도록** 강제할 수 있다.

1. VSCode에서 **설정(User Settings)**을 열고,
2. **"Import Module Specifier"**를 검색하면 **TypeScript 및 JavaScript용 설정**이 나타난다.
3. 이를 `"non-relative"`로 변경하면, **항상 경로 별칭(alias)을 사용**하도록 강제할 수 있다.

---

### **VSCode `settings.json` 직접 수정**

만약 설정 파일을 직접 수정하고 싶다면, `settings.json`에 아래 내용을 추가하면 된다.

```json
{
  //...
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "javascript.preferences.importModuleSpecifier": "non-relative"
  //...
}
```

이렇게 설정하면, VSCode에서 자동으로 import를 정리할 때 **상대경로(`./`)가 아닌 경로 별칭(`@/`)을 사용**하도록 변경된다.

## shadcn/ui 설치

`npx shadcn@latest init`

cli가 실행되면 아래와 같이 선택한다

```
Which style would you like to use? › New York
Which color would you like to use as base color? › Zinc
Do you want to use CSS variables for colors? › no
```

[New York 스타일과 Default 스타일의 비교](https://www.shadcndesign.com/blog/difference-between-default-and-new-york-style-in-shadcn-ui)

New York Style과 Zinc Color가 기본이기에 선택하였다.  
색상은 테일윈드에 설정된 색상들이 친숙하기에 CSS Variables를 No로 선택하였다.

## Route Groups

`(Home)` 처럼 괄호로 묶으면 url로 인식되지 않는다.  
중첩 레이아웃을 활성화 할 때에 용이하다.

## shadcn 컴포넌트 추가하기

`npx shadcn@latest add button`

### alias 설정

```
TypeScript › Preferences: Import Module Specifier
Preferred path style for auto imports.
```

vscode코드에서 'non-relative'로 변경하면 tsconfig.json의 설정을 우선적으로 따른다.

tsconfig.json 에서 Path는 아래와 같다.

```
    "paths": {
      "@/*": ["./*"]
    }
```

이를 아래와 같이 수정한다.

```
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"],
      "@ui/*": ["components/ui/*"]
    }
```

### cn

cn은 shadcn에서 설정해둔 테일윈드용 clsx의 유틸함수다.

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

twMerge라이브러리를 사용하여 테일윈드에서 clsx를 사용할 수 있게 해준다.

아래와 같이 사용한다.

```tsx
import { cn } from "@/lib/utils";
import { Button } from "@ui/button";

export default function Home() {
  const number = 10;
  return (
    <div className="">
      <Button className={cn(number > 5 && "bg-gray-300")}>하이루</Button>
    </div>
  );
}
```

## 다이나믹 라우팅

`app\example\[id]\page.tsx` 파일에서 `[id]` 는 slug이다.

해당 슬러그는 props.params.id로 접근할 수 있다.

또한 쿼리스트링은 props.searchParams에서 접근할 수 있다.

Next.js 15에서는 해당 props들은 async/await를 통해 접근하도록 분리되었다. (이에 따라 React.use 훅을 통해서도 접근이 가능하다.)

```tsx
interface LoginProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort: string }>;
}

const Login: React.FC<LoginProps> = async ({
  params,
  searchParams,
}: LoginProps) => {
  const { id } = await params;
  const { sort } = await searchParams;
  return (
    <div>
      <div>{id}</div>
      <div>{sort}</div>
    </div>
  );
};

export default Login;
```

`http://localhost:3000/example/30?sort=desc` 주소로 들어갈 시 아래와 같이 화면에 출력된다.

```
30
desc
```

# supabase

Supabase는 '파이어베이스의 오픈소스형 대안'을 표방한다.  
파이어베이스에서 지원하는 실시간 데이터베이스에 더해

PostgresSQL 기반으로 작동하며, Row Level Security, OAuth 2.1 기반의 PKCE flow 인증, Next.js를 위한 서버클라이언트도 지원한다.

오픈소스이기에 소스코드만 별도로 on premise로 배포도 가능하다.

[https://supabase.com](https://supabase.com)

## Supabase 시작하기

### env 설정

1. supabase에서 로그인을 한 후, [https://supabase.com/dashboard/projects](https://supabase.com/dashboard/projects) 에서 new project를 눌러 프로젝트를 생성한다.

2. 프로젝트의 대시보드에서 `https://supabase.com/dashboard/project/프로젝트 주소/settings/api`에 접속하면 Project URL과 Project API Keys를 확인할 수 있다.

   - anon(혹은 public)은 next.js 등에서 데이터베이스에 접속할 때 사용된다.
   - service_role은 관리자 페이지 등을 만들 때 사용하나, 해당 키가 유출되는 경우 데이터베이스의 보안에 큰 지장을 준다.

3. 해당 Project URL과 Project API Keys를 next.js 프로젝트의 `/.env`파일에 아래와 같이 설정해준다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://****.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciO****.****
```

### install

[Creating a Supabase client for SSR - supabase docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

```
yarn add @supabase/supabase-js@^2.42.0
yarn add @supabase/ssr@^0.1.0
yarn add @supabase/auth-ui-react@^0.4.7
yarn add @supabase/auth-ui-shared@^0.1.8
```

`@supabase/supabase-js`는 supabase 실행에 필요한 라이브러리이다.  
`@supabase/ssr`는 supabase를 server-side에서 실행시킬 수 있도록 하는 라이브러리이다.  
나머지는 로그인 예시를 만들기 위해 supabase에서 제공하는 로그인 라이브러리이다.

### types 설정

[https://supabase.com/docs/guides/api/rest/generating-types](https://supabase.com/docs/guides/api/rest/generating-types)

SUPABASE 프로젝트의 데이터들을 타입으로 자동으로 만들어준다.

1. 먼저 supabase cli를 설치해준다.

```
npm i supabase@">=1.8.1" --save-dev
```

2. 데이터베이스에 로그인한다.

   - `npx supabase login` 을 입력한다.
   - 웹 브라우저에 접속하여 로그인한다.
   - 웹 브라우저에서 노출시킨 verification code를 터미널에 입력한다. `Enter your verification code: e009d6e5`

3. gen types 명령어를 입력하여 타입스크립트 파일을 생성한다.
   - `npx supabase gen types typescript --project-id {Project ID} --schema public > types/supabase.ts`
   - 이때 {Project ID}는 supabase의 프로젝트 /settings/general 에서 확인할 수 있다. `https://supabase.com/dashboard/project/{Project ID}/settings/general`

보다 편리한 사용을 위해서는 gen types 명령을 아래와 같이 package.json의 script에 추가해줄 수 있다.

```json
{
  "name": "supa-next-todo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "supabase:gen":"npx supabase gen types typescript --project-id rirtnceyccxjlupupgxi --schema public > types/supabase.ts"
  },
...
}
```

## Supabase CreateClient 만들기

[Supabase is now compatible with Next.js 14 - supabase blogs](https://supabase.com/blog/supabase-is-now-compatible-with-nextjs-14)  
[Use Supabase with Next.js - supabase docs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

Next.js 14의 App Router에서 Supabase를 사용하려면 Client용, Server용 슈퍼베이스 클라이언트 두 개가 필요하며, 부가적으로 Server용에 미들웨어를 적용하게 된다.

### Client용

`utils\supabase\client.ts`

```ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### Server 용

cookies에 담긴 JWT 토큰을 읽어 세션을 업데이트하는 로직이 추가된다.

```ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
```

### 미들웨어

요청을 받을 때마다 실행할 로직을 작성해둘 수 있다.

예시에서는

1. updateSession을 통해서 쿠키를 업데이트 한다.
2. supabase.auth를 통해 유저의 정보를 전달받은 후, user의 정보에 맞게 redirect를 시킨다.

```ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (request.nextUrl.pathname === "/" && !user.error) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
```

미들웨어를 적용하기 위해서는 프로젝트의 루트 폴더에 `middleware.ts` 를 만든 후 적용하면 된다.

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

참고로 해당 미들웨어를 적용하면, 서버 컴포넌트에서는 `utils\supabase\server.ts`의 `setAll(cookiesToSet)`이 실행되지 않는다.

## Auth 구현

### Implicit Flow vs. PKCE (Proof Key for Code Exchange) Flow

1. Implicit Flow

   - 클라이언트가 인증 서버에 로그인을 요청한 후, 토큰을 클라이언트 측에 저장한다.
   - URL 혹은 Request에 해당 토큰을 담아 사용한다.
   - 토큰이 쉽게 탈취될 가능성이 있고 CSRF(사이트간 위조)를 방어하기 취약하다.

2. PKCE
   - 클라이언트가 임의의 난수(code_verifier)와 난수를 암호화한 수(code_challenge)를 가짐
   - 서버가 code_challenge를 전달받음.
   - 이후 클라이언트가 엑세스 토큰을 요청할 때마다 code_verifier를 함께 보내고, code_verifier가 유효할 때에만 엑세스 토큰이 발급됨.
   - 토큰이 유출되더라도 토큰이 만료되면 code_verifier가 있어야 새로운 토큰을 발급받을 수 있으며, code_verifier는 엑세스 토큰에 비해 유출될 위험이 비교적 적음.

### PKCE (Proof Key for Code Exchange) Flow 구현

#### Google 로그인 구현

##### Google Cloud API Oauth 세팅

- [구글 클라우드 콘솔](https://console.cloud.google.com/) 에 접속한다.
- 새 프로젝트를 생성한다.
- [프로젝트-API 및 서비스-OAuth 동의 화면](https://console.cloud.google.com/auth/overview)에 접속한다.
- '시작하기' 버튼을 누른 후 아래와 관련된 사항들을 입력하여 OAuth를 시작한다.
  - '앱 이름'(로그인 시 노출될 프로젝트 명)
  - '사용자 지원 이메일'(내 이메일)
  - '대상'(외부)
- 이제 Supabase에 접속해서 'https://supabase.com/dashboard/project/{Project ID}/auth/providers'에 접속하여 Google을 Provider로 선택한다.
- 해당 페이지에서 'Callback URL (for OAuth)'를 확인한다.
- 다시 구글 클라우드 콘솔 [프로젝트-API 및 서비스-OAuth 동의 화면](https://console.cloud.google.com/auth/overview)에서 'OAuth 클라이언트 만들기'를 클릭하고 아래의 사항들을 입력하여 Client를 만든다.
  - '애플리케이션 유형'(웹 애플리케이션)
  - '승인된 JavaScript 원본'(http://localhost:3000)
  - '승인된 리디렉션 URI'(https://{Project ID}.supabase.co/auth/v1/callback)
- 다시 Supabase에 접속해서 'https://supabase.com/dashboard/project/{Project ID}/auth/providers'에 아래 사항들을 입력해준다.
  - Enable Sign in with Google를 활성화한다.
  - 클라이언트 ID : Google OAuth 클라이언트의 ID (566..877-cuhhs...apps.googleusercontent.com)
  - 클라이언트 Secret : Google OAuth 클라이언트의 보안 비밀번호 (GO...PX-fK...xQ)
- 이제 Supabase에 Google Cloud API의 OAuth Client가 등록되었다.

##### Route Handlers 구현

- .env 파일에 `NEXT_PUBLIC_BASE_URL=http://localhost:3000`을 변수명으로 추가해준다. (해당 변수명은 배포/개발시마다 바뀔 수 있다.)
- 아래와 같이 `app\auth\callback\route.ts` 파일을 작성한다.
  - code : 인증서비스제공자가 Authorization Code를 supabase 서버에 전달하면, supabase 서버는 이를 Search Params의 code라는 key에 담아서 보내준다.
  - next : Next.js에서 이동할 URL을 설정할 때에는 next라는 key로 이동할 url을 Search Params에 담으면 된다.
  - exchangeCodeForSession : supabase 클라이언트에서 Authorization Code를 인자로 받아, access_token을 반환받고 세션을 생성한다.
  - if !error : exchange가 성공적으로 완료되면 사용자를 redirect한다. (forwardedHost는 한 어플리케이션을 여러 서버가 다룰 때에 사용하는 서버의 주소이다.(로드 밸런싱 방식))

```tsx
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
```

##### Pages 구현

- login page : signInWithOAuth 클라이언트에 provider와 /auth/callback 주소를 전송한다.

```tsx
// app/auth/login/page.tsx (로그인 페이지)
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google", // Google OAuth 로그인
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      router.push(
        `/auth/auth-code-error?message=${encodeURIComponent(error.message)}`
      );
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">로그인</h1>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "로그인 중..." : "Google 로그인"}
      </button>
    </div>
  );
}
```

- auth-code-error에서는 searchParams으로 넘어온 에러 메시지를 노출시킨다.

```tsx
import Link from "next/link";

// app/auth/auth-code-error/page.tsx (로그인 에러 페이지)
export default function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const errorMessage =
    searchParams?.message || "로그인 중 문제가 발생했습니다.";

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-red-500">인증 오류 발생</h1>
      <p className="text-gray-600 mt-2">{errorMessage}</p>
      <Link
        href="/auth/login"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        로그인 다시 시도하기
      </Link>
    </div>
  );
}
```

#### Password 로그인 구현

[Supabase is now compatible with Next.js 14 - supabase blogs](https://supabase.com/blog/supabase-is-now-compatible-with-nextjs-14) 를 참고하여 Sign-up 액션과 Sign-in 액션을 구현하여 보자.

##### Redirect용 Util 함수

utils\encodedRedirect.tsx

```tsx
import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success", // 메시지 타입 (에러 또는 성공)
  path: string, // 리디렉션할 경로
  message: string // 전달할 메시지
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}
```

encodeURIComponent는 JavaScript 내장 함수로, 특수 문자나 공백이 포함된 문자열을 URL-safe 형식으로 인코딩하는 역할을 합니다.

##### Actions

## 🚀 **📌 코드 분석 요약**

1. **회원가입 (`signUpAction`)**

   - 이메일과 비밀번호를 받아 **Supabase에 회원가입 요청**.
   - 인증 이메일을 전송하고, 성공 또는 실패 여부에 따라 적절한 페이지로 **리디렉션**.

2. **로그인 (`signInAction`)**

   - 이메일과 비밀번호를 받아 **Supabase에 로그인 요청**.
   - 로그인 실패 시 `/sign-in`으로 **에러 메시지를 포함하여 리디렉션**.
   - 로그인 성공 시 **보호된 페이지 `/protected`로 이동**.

3. **비밀번호 재설정 요청 (`forgotPasswordAction`)**

   - 이메일을 받아 **비밀번호 재설정 이메일을 전송**.
   - 실패하면 `/forgot-password`로 **에러 메시지를 포함하여 리디렉션**.
   - 성공하면 사용자가 이메일을 확인하도록 안내하는 메시지를 포함하여 **리디렉션**.

4. **비밀번호 변경 (`resetPasswordAction`)**

   - 사용자가 입력한 **새 비밀번호를 확인 후 Supabase에 업데이트 요청**.
   - 비밀번호가 일치하지 않거나 요청이 실패하면 **에러 메시지를 포함하여 리디렉션**.
   - 성공 시 비밀번호가 변경되었음을 알리는 메시지를 포함하여 **리디렉션**.

5. **로그아웃 (`signOutAction`)**
   - Supabase에서 **세션을 삭제하고 `/sign-in` 페이지로 이동**.

✔️ **모든 액션에서 `encodedRedirect()`를 활용하여 성공/실패 메시지를 포함한 리디렉션을 수행하는 것이 특징!** 🚀

app\auth\actions.tsx

```ts
"use server"; // Next.js의 Server Actions를 사용하도록 지정

import { encodedRedirect } from "@/utils/encodedRedirect"; // 메시지를 포함한 리디렉션 함수
import { createClient } from "@/utils/supabase/server"; // Supabase 클라이언트 생성 함수
import { headers } from "next/headers"; // 요청 헤더 가져오기
import { redirect } from "next/navigation"; // Next.js 리디렉션 함수

// ✅ 회원가입 처리 (Sign Up)
export const signUpAction = async (formData: FormData) => {
  // 폼 데이터에서 이메일과 비밀번호 추출
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient(); // Supabase 클라이언트 생성
  const origin = (await headers()).get("origin"); // 현재 요청의 Origin (도메인) 가져오기

  // 이메일 또는 비밀번호가 없으면 에러 메시지를 포함하여 리디렉션
  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  // Supabase를 사용해 회원가입 요청
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`, // 이메일 확인 후 이동할 URL 설정
    },
  });

  // 에러 발생 시 에러 메시지를 포함하여 리디렉션
  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // 회원가입 성공 시 성공 메시지를 포함하여 리디렉션
  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link."
  );
};

// ✅ 로그인 처리 (Sign In)
export const signInAction = async (formData: FormData) => {
  // 폼 데이터에서 이메일과 비밀번호 추출
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient(); // Supabase 클라이언트 생성

  // Supabase를 사용해 로그인 요청
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 에러 발생 시 에러 메시지를 포함하여 리디렉션
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // 로그인 성공 시 보호된 페이지로 이동
  return redirect("/protected");
};

// ✅ 비밀번호 재설정 요청 (Forgot Password)
export const forgotPasswordAction = async (formData: FormData) => {
  // 폼 데이터에서 이메일 추출
  const email = formData.get("email")?.toString();
  const supabase = await createClient(); // Supabase 클라이언트 생성
  const origin = (await headers()).get("origin"); // 현재 요청의 Origin (도메인) 가져오기
  const callbackUrl = formData.get("callbackUrl")?.toString(); // 콜백 URL이 있는 경우 가져오기

  // 이메일이 없으면 에러 메시지를 포함하여 리디렉션
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  // Supabase를 사용해 비밀번호 재설정 이메일 전송 요청
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`, // 비밀번호 재설정 후 이동할 URL 설정
  });

  // 에러 발생 시 에러 메시지를 포함하여 리디렉션
  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  // 콜백 URL이 있으면 해당 URL로 리디렉션
  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  // 비밀번호 재설정 이메일이 전송되었음을 알리는 메시지 포함하여 리디렉션
  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

// ✅ 비밀번호 변경 처리 (Reset Password)
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient(); // Supabase 클라이언트 생성

  // 폼 데이터에서 새 비밀번호와 확인용 비밀번호 추출
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // 비밀번호 또는 확인용 비밀번호가 없으면 에러 메시지를 포함하여 리디렉션
  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  // 비밀번호와 확인용 비밀번호가 일치하지 않으면 에러 메시지를 포함하여 리디렉션
  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  // Supabase를 사용해 비밀번호 변경 요청
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  // 에러 발생 시 에러 메시지를 포함하여 리디렉션
  if (error) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  // 비밀번호 변경 성공 시 성공 메시지를 포함하여 리디렉션
  return encodedRedirect(
    "success",
    "/protected/reset-password",
    "Password updated"
  );
};

// ✅ 로그아웃 처리 (Sign Out)
export const signOutAction = async () => {
  const supabase = await createClient(); // Supabase 클라이언트 생성

  // Supabase를 사용해 로그아웃 요청
  await supabase.auth.signOut();

  // 로그아웃 후 로그인 페이지로 이동
  return redirect("/sign-in");
};
```

---

해당 Server Actions는 두 가지 사용법이 있다.

1. Form 태그에 action 속성에 넘겨주는 방법

```tsx
<form action={signOutAction}>
  <button type="submit">Sign out</button>
</form>
```

2. Form 태그 내부의 Button 태그에 formAction 속성에 넘겨주는 방법

```tsx
<form>
  <button formAction={signOutAction}>Sign out</button>
</form>
```

## CRUD 구현

### 테이블 추가

- Supabase - 대시보드 - 테이블 에디터로 접속한다. `https://supabase.com/dashboard/project/{Project Id}/editor`
- Client에서 기본적으로 다루는 Schema는 Public이다. Public Schema를 선택한 후, 'Create a new table'을 클릭한다.
- 테이블 명은 'todos_with_rls'
- Columns는 아래와 같이 설정한다.

| name       | type        | default value | primary |
| ---------- | ----------- | ------------- | ------- |
| id         | int8        | null          | O       |
| user_id    | uuid        | auth.uid()    | X       |
| content    | text        | null          | X       |
| created_at | timestamptz | now()         | X       |
| updated_at | timestamptz | now()         | X       |
| deleted_at | timestamptz | null          | X       |

`user_id`는 Name에서 foreign key 옵션을 클릭하여 아래와 같이 설정한다.

- Select a schema : **auth**
- Select a table to reference to : **users**
- Select columns from auth.usersto reference to : **public.todos_with_rls.user_id -> auth.users.id**
- Action if referenced row is updated : **Cascade**
- Action if referenced row is removed : **Cascade**
- `timestamptz`는 클라이언트의 세션 시간대를 조회하여 UTC 기준으로 변환하여 저장하는 타입이다.

### Postgres SQL의 Row-Level Security (RLS)

- 행 수준 보안. 사용자가 어떤 행에 접근할 수 있는지를 설정할 수 있는 기능을 한다.

```Postgres SQL
create policy "policy_name"
on "public"."todos_with_rls"
as PERMISSIVE
for SELECT
to public
using (true);
```

- **_create_ policy "policy_name"** : 정책을 생성한다. 이름을 "policy_name"로 설정했다.
- **_on_ "public"."todos_with_rls"** : 적용할 테이블을 지정한다. "public" 스키마의 "todos_with_rls" 테이블을 지정했다.
- **_as_ PERMISSIVE** : 정책의 유형을 지정한다. `PERMISSIVE`는 접근할 수 있는 사용자를 지정하는 유형이고, `RESTRICTIVE`는 접근이 불가능한 사용자를 지정하는 유형이다.
- **_for_ SELECT** : 작동 대상 및 권한. `SELECTE(조회)`, `INSERT(삽입)`, `UPDATE(수정)`, `DELETE(삭제)`
- **_to_ public** : 대상 사용자. `public(모두)`, `authenticated(로그인 된 사용자)`
- **_using_ ()** : 괄호 안의 조건을 충족할 때에만 해당 조건이 작동한다. `using (true)`는 항상. `using ((select auth.uid()) = user_id)`는 user_id가 같을 때에 작동한다.
  - using 정책이 적용되면, 내부적으로 WHERE 절을 활용하여 필터링이 수행된다. 즉, 다음과 같은 필터링이 자동으로 적용된다. [Row Level Security - Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
  ```sql
  SELECT * FROM todos_with_rls WHERE auth.uid() = todos_with_rls.user_id;
  ```
  결과적으로, todos_with_rls 테이블의 user_id 컬럼이 현재 로그인한 사용자의 auth.uid() 값과 동일한 경우에만 행이 반환된다.

using 표현식과 with check 표현식의 차이는 아래와 같다.
| **구분** | **`using`** | **`with check`** |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| **목적** | 데이터에 대한 **조회**, **업데이트**, **삭제** 권한을 제한 | 데이터 삽입 및 수정 시 **유효성 검사** |
| **시점** | 쿼리 실행 시, **행이 선택**될 때 조건을 적용 | 데이터가 **삽입**되거나 **수정**될 때 조건을 적용 |
| **사용처** | 사용자가 접근할 수 있는 행을 필터링 | 새로운 행이 데이터베이스에 삽입되거나 업데이트될 때 조건 검증 |

### RLS Policy 추가

- Supabase - 대시보드 - Authentication - Configuration - Policies로 접속한다. `https://supabase.com/dashboard/project/{Project ID}/auth/policies`
- todos_with_rls 테이블에 'Create policy' 버튼을 클릭한다.
- `Select - Enable read access for all users` 를 클릭한 후 `Save Policy`를 눌러 정책을 추가해준다. 앞서 예시로 든 `using(true)`를 사용한 Select 정책이 추가된다.
- `Insert - Enable insert for authenticated users only`를 클릭한 후 `Save Policy`를 눌러 정책을 추가해준다. `with check (true)`라는 표현식이 끝에 붙는데, with check는 명령을 실행하기 전에 조건을 충족하는지를 체크한다. true로 두었기에 로그인 한 유저 누구나 작성할 수 있다.
- `Update - Enable update for users based on email` 템플릿을 클릭하면 아래와 같이 템플릿이 나온다.

```Postgres SQL
create policy "Enable update for users based on email"
on "public"."todos_with_rls"
as PERMISSIVE
for UPDATE
to public
using (
  (select auth.jwt()) ->> 'email' = email
with check (
  (select auth.jwt()) ->> 'email' = email
);
```

이를 uid와 비교하도록 아래와 같이 수정한 후 Save Policy를 한다.

```Postgres SQL
create policy "Enable update for users based on user_id"
on "public"."todos_with_rls"
as PERMISSIVE
for UPDATE
to public
using (
  (select auth.uid()) = user_id
with check (
  (select auth.uid()) = user_id
);
```

[업데이트 RLS에 대한 설명 - Reddit](https://www.reddit.com/r/Supabase/comments/18bj4u4/implementing_rls_policy_for_item_updates_in/?rdt=34917)

- `DELETE - Enable delete for users based on user_id`를 클릭한 후 `Save Policy`를 눌러 정책을 추가해준다.

이로써 CRUD에 대한 RLS 정책들을 추가 완료하였다.

### CRUD Server Actions 구현

#### SELECT

`select("*")`로 데이터를 불러온 후, `.eq()`, `.lt()`, `.is()`와 같은 연산자를 추가하여 조건을 넣는다.

```tsx
// todoList 가져오기 + by UserId
export const getTodosByUserId = async (userId: string) => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .select("*")
    .is("deleted_at", null)
    .eq("user_id", userId);

  return result.data;
};
```

위의 예시에서 사용된 SELECT 구문은 아래와 같다.

```SQL
SELECT * FROM "todos_with_rls"
WHERE deleted_at IS NULL
AND user_id = '사용자_ID';
```

특정 문자열을 받아 검색하는 구문은 아래와 같다. 이때 ilike는 대소문자를 구별하지 않는 검색이다.

```tsx
// todoList 가져오기 + search
export const getTodosBySearch = async (terms: string) => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .select("*")
    .is("deleted_at", null)
    .ilike("content", `%${terms}%`)
    .order("id", { ascending: false })
    .limit(500);

  return result.data;
};
```

#### INSERT

```tsx
// todoList 생성하기
export const createTodos = async (content: string) => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .insert({
      content,
    })
    .select();

  return result.data;
};
```

#### UPDATE

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

  return result.data;
};
```

#### DELETE

```tsx
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

  return result.data;
};
```

## Data Fetching과 Caching

앞서 만든 Todo Actions를 통해 Data Fetching과 Caching을 구현한다.

먼저 app\example\page.tsx 를 아래와 같이 만든다.

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  // ✅ userId가 없으면 로그인 페이지로, 있으면 해당 경로로 리다이렉트
  if (!userId) {
    redirect("/auth/login");
  } else {
    redirect(`/example/${userId}`);
  }
}
```

`redirect(`/example/${userId}`);`를 이용해 `app\example\[userId]\page.tsx`로 이동시킨다.
id를 params로 받아 Caching하기 위함이다.

`app\example\[userId]\page.tsx`는 아래와 같이 만든다.

```tsx
import TodoAdder from "@/components/example/TodoAdder";
import TodoListCached from "@/components/example/TodoListCached";
import TodoListFetch from "@/components/example/TodoListFetch";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { userId } = await params;
  return (
    <div>
      <TodoAdder />
      <TodoListCached userId={userId} />
      <TodoListFetch userId={userId} />
    </div>
  );
}
```

`TodoAdder` : Todo 리스트를 생성하는 컴포넌트이다.
`TodoListCached` : Todo 리스트를 server action으로 불러온 후, unstable_cache를 통해서 caching하는 컴포넌트이다.
`TodoListFetch` : Todo 리스트를 Next.js의 확장된 fetch를 통해 불러와 caching하는 컴포넌트이다.

### server action에 타입 지정하기

`npx supabase gen` 명령어로 타입을 지정했다면 응답으로 올 DATA의 타입도 생성이 된다.
`Database["public"]["Tables"]["todos_with_rls"]["Insert"]` 타입은 Insert를 실행했을 때의 데이터이다.

아래와 같이 createTodos의 응답값에 대하여 `Promise<Array<Database["public"]["Tables"]["todos_with_rls"]["Insert"]> | null>`라는 타입을 지정해주자.

result는 기본적으로 `PostgrestSingleResponse<any[]>` 타입을 갖는데, server action에 타입을 지정해줌으로써 result.data의 타입이 추론된다.

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

  return result.data;
};
```

### TodoAdder Component

```tsx
//components\example\TodoAdder.tsx
import { createTodos } from "@/app/example/[userId]/actions";

export default function TodoAdder() {
  async function formAction(formData: FormData) {
    "use server";

    const content = formData.get("contentInput");
    if (typeof content !== "string") return; // Type Guard

    await createTodos(content);
    // 생성을 완료한 후 실행할 로직들을 이곳에 작성합니다.
  }

  return (
    <form action={formAction}>
      <input name="contentInput" placeholder="할 일을 적어라" />
      <button type="submit">할 일 추가</button>
    </form>
  );
}
```

1. `formAction` 이라는 새로운 server action을 생성해주었다. server action 함수는 "use server" 지시자를 입력하여 만든다.
2. `FormData` 인터페이스의 `.get(name)`라는 인스턴스 메서드를 통해 FormData에 있는 요소를 가져올 수 있다. 이때 파라미터는 HTML요소의 name 어트리뷰트와 일치한다.
3. `formData.get(name)`으로 가져온 데이터는 `any` 타입으로 지정되어 있어 Type Guard를 사용해주어야 한다.
4. 이후 `formData.get(name)`으로 가져온 데이터를 앞서 만든 `createTodos`라는 server action에 파라미터로 넘겨주며 이를 실행한다.

### Fetch를 이용한 데이터 캐싱

기본적으로 Next.js App Router에서 사용되는 방법이다.

1. 확장된 fetch로 api를 호출한다.
2. 이때 fetch의 옵션에 `{ next : { tags : [태그명]}}`을 넣어준다.
3. 이후엔 `revalidateTag`함수를 이용하여 해당 fetch로 캐시한 데이터를 revalidate 시킬 수 있다.

- 주의사항 : revalidateTag는 서버에 cache된 데이터를 revalidate하는 것이기 때문에 'use client' 지시자 안에서는 사용할 수 없음. server action 등으로 따로 빼야함.

#### Route Handlers

Route Handler는 Search Params를 통해 userId를 가져오도록 한다.  
이후 getTodos 서버액션을 이용하여 데이터를 읽어 반환한다.

```tsx
// app/api/todos/route.ts
import { getTodosByUserId } from "@/app/example/[userId]/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // searchParams에서 userId를 가져온다.
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // getTodosByUserId 서버 액션을 이용하여 데이터를 가져온다.
    const todos = await getTodosByUserId(userId);
    return NextResponse.json(todos);
  } catch (_e) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}
```

이때 catch(error)에서 eslint 에러가 발생하므로 아래와 같이 eslint.config.mjs 를 수정하였다. [How to disable warn about some unused params](https://stackoverflow.com/questions/64052318/how-to-disable-warn-about-some-unused-params-but-keep-typescript-eslint-no-un)

```tsx
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // 추가된 부분
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        }, // _로 시작하는 인자는 사용되지 않아도 경고하지 않음
      ],
    },
  },
];
```

위와 같이 예외 패턴을 만든 후, catch(\_error)를 사용하면 에러가 뜨지 않는다.

#### TodoListFetch Component

1. TodoListFetch 컴포넌트에서는 fetch()를 통해 Route Handlers를 호출한다. 해당 데이터는 `todosByFetch-${userId}`의 태그로 관리된다.
2. 버튼을 눌러 buttonAction을 실행시키면, `todosByFetch-${userId}`를 revalidate한다.

```tsx
import { Database } from "@/types/supabase";
import { revalidateTag } from "next/cache";

interface TodoListFetchProps {
  userId: string;
}

type Todo = Database["public"]["Tables"]["todos_with_rls"]["Row"];

export default async function TodoListFetch({ userId }: TodoListFetchProps) {
  // 데이터를 캐싱할 때 관리할 태그명을 지정한다.
  const cacheTag = `todosByFetch-${userId}`;

  // () => 캐싱된 데이터를 revalidateTag로 revalidate하는 함수
  async function buttonAction() {
    "use server";
    revalidateTag(cacheTag);
  }

  // fetch를 통해 데이터를 불러온다.
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/todos?userId=${userId}`,
    {
      next: { revalidate: 10000000, tags: [cacheTag] }, // 장기간 캐싱 (revalidateTag로 갱신)
    }
  );

  // 데이터를 파싱한다.
  const todos: Todo[] = await res.json();

  return (
    <div>
      {/* 컴포넌트 설명 */}
      <h1>&quot;확장된 Fetch&quot;를 이용하여 데이터를 캐싱하기</h1>
      {/* 새로고침 버튼 */}
      <form>
        <button formAction={buttonAction} type="submit">
          Fetch로 불러온 리스트 새로고침하기
        </button>
      </form>
      {/* TodoList목록 */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Server Action과 unstable_cache를 이용한 데이터 캐싱

Server Action은 fetch()와 다르게 데이터 캐싱을 지원하지 않지만, unstable_cache() 함수를 이용하여 서버에 캐시해둘 수 있다.

#### server/createClient 수정

unstable_cache() 함수의 fetcher 안에서는 Next.js의 headers()나 cookies()를 사용할 수 없다.

이애 따라 supabase의 server/createClient를 수정할 필요가 있다. [Stack Overflow 참고](https://stackoverflow.com/questions/78177462/has-anyone-encountered-dynamic-server-usage-due-to-using-unstable-caching-in-nex)

아래와 같이 cookieStore를 param으로 외부에서 넘겨 받는 경우에는 `cookies()`를 비활성화하도록 한다.

```tsx
// utils/supabase/server.ts
/* 수정 전
export const createClient = async () => {
  const cookieStore = await cookies();
*/
export const createClient = async (
  initialCookieStore?: ReadonlyRequestCookies
) => {
  const cookieStore = initialCookieStore || (await cookies());
```

이렇게 하면 외부에서 createClient 외부에서 cookies()를 실행할 수 있게 된다.

이를 이용하여 `getTodosByUserId` 서버 액션도 외부로부터 cookieStore를 받도록 수정해준다.

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
    .eq("user_id", userId);

  return result.data;
};
```

### TodoListCached Component

Server Actions로 데이터를 불러온 후, unstable_cache를 통해서 캐싱한다.
unstable_cache는 fetcher, keys, option을 인자로 받으며,
unstable_cache로 랩핑된 함수는 fetcher의 인자를 인자로 받는다.

```tsx
import { getTodosByUserId } from "@/app/example/[userId]/actions";
import { revalidateTag, unstable_cache } from "next/cache";
import { cookies } from "next/headers";

interface TodoListFetchProps {
  userId: string;
}

export default async function TodoListFetch({ userId }: TodoListFetchProps) {
  // 데이터를 캐싱할 때 관리할 태그명을 지정한다.
  const cacheTag = `todosByServerAction-${userId}`;

  // () => 캐싱된 데이터를 revalidateTag로 revalidate하는 함수
  async function buttonAction() {
    "use server";
    revalidateTag(cacheTag);
  }

  // Server Action로 받아온 데이터를 캐싱하는 `unstable_cache` 래퍼
  const cachedFetchTodos = unstable_cache(getTodosByUserId, [userId], {
    revalidate: 10000000, // 10000000초 동안 캐싱 (갱신은 revalidateTag로 관리)
    tags: ["todosCache"],
  });

  // cookies()를 외부에서 실행시켜 cookieStore로 만든다.
  const cookieStore = await cookies();
  // cachedFetchTodos에 userId와 cookieStore를 인자로 넘겨 Server Action을 실행시켜 데이터를 받는다.
  const todos = await cachedFetchTodos(userId, cookieStore);

  if (!todos) return <div>할 일이 없습니다.</div>;

  return (
    <div>
      {/* 컴포넌트 설명 */}
      <h1>&quot;Server Action&quot;을 이용하여 데이터를 캐싱하기</h1>
      {/* 새로고침 버튼 */}
      <form>
        <button formAction={buttonAction} type="submit">
          Server Action으로 불러온 리스트 새로고침하기
        </button>
      </form>
      {/* TodoList목록 */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
    </div>
  );
}
```

이제 `app/todo` 에서 shadcn을 이용해 ui를 구축하도록 한다.
[➡ TODO APP README로 이동하기](app/todo/README.md)
