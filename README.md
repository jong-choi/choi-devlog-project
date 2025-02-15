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


