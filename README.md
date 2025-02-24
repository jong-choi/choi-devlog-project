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

tafce : 폴더명을 기준으로 컴포넌트를 생성 후 export한다.  
tafcep : props children을 가지는 인터페이스와 함께 컴포넌트를 생성한다.  
tafcem : React.memo를 import하여 감싼 후 export한다.  
...f : 폴더명이 아닌 파일명을 기준으로 생성한다.  

```json
{
	"TSX Arrow Function Component Export": {
		"prefix": "tafce",
		"body": [
			"const ${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/}: React.FC = () => {",
			"  return <div>${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/}</div>;",
			"};",
			"",
			"export default ${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/};"
		],
		"description": "TSX Arrow Function Component Export with Folder Name and React.FC"
	},
	"TSX Arrow Function Component Export Memoized": {
		"prefix": "tafcem",
		"body": [
			"import { memo } from \"react\";",
			"",
			"const ${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/}: React.FC = () => {",
			"  return <div>${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/}</div>;",
			"};",
			"",
			"export default memo(${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/});"
		],
		"description": "TSX Memoized Arrow Function Component Export with Folder Name and React.FC"
	},
	"TSX Arrow Function Component with Props Export": {
		"prefix": "tafcep",
		"body": [
			"interface ${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/}Props {",
			"  children: React.ReactNode;",
			"}",
			"",
			"const ${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/}: React.FC<${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/}Props> = ({",
			"  children,",
			"}) => {",
			"  return <div>{children}</div>;",
			"};",
			"",
			"export default ${TM_DIRECTORY/(.+[\\/\\\\])?([^\\/\\\\]+)[\\/\\\\]*$/${2:/pascalcase}/};"
		],
		"description": "TSX Arrow Function Component with Props Interface Export based on Folder Name"
	},
	"TSX Arrow Function Component Export (File Name)": {
		"prefix": "tafcef",
		"body": [
			"const ${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}: React.FC = () => {",
			"  return <div>${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}</div>;",
			"};",
			"",
			"export default ${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/};"
		],
		"description": "TSX Arrow Function Component Export with File Name and React.FC"
	},
	"TSX Arrow Function Component Export Memoized (File Name)": {
		"prefix": "tafcemf",
		"body": [
			"import { memo } from \"react\";",
			"",
			"const ${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}: React.FC = () => {",
			"  return <div>${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}</div>;",
			"};",
			"",
			"export default memo(${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/});"
		],
		"description": "TSX Memoized Arrow Function Component Export with File Name and React.FC"
	},
	"TSX Arrow Function Component with Props Export (File Name)": {
		"prefix": "tafcepf",
		"body": [
			"interface ${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}Props {",
			"  children: React.ReactNode;",
			"}",
			"",
			"const ${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}: React.FC<${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/}Props> = ({",
			"  children,",
			"}) => {",
			"  return <div>{children}</div>;",
			"};",
			"",
			"export default ${TM_FILENAME_BASE/(.+)/${1:/pascalcase}/};"
		],
		"description": "TSX Arrow Function Component with Props Interface Export based on File Name"
	}
}
```


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
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

PostgresSQL 기반으로 작동하며, Row Level Security, OAuth 2.0 기반의 PKCE flow 인증, Next.js를 위한 서버클라이언트도 지원한다.  

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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

### Server 용
cookies에 담긴 JWT 토큰을 읽어 세션을 업데이트하는 로직이 추가된다.
```ts
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
    },
  );
};
```

### 미들웨어
요청을 받을 때마다 실행할 로직을 작성해둘 수 있다.

예시에서는 supabase.auth를 통해 유저의 정보를 전달받은 후, 

user의 정보에 맞게 redirect를 시킨다.

```ts
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
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
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


