# 기술 블로그 개발 프로젝트

## 프로젝트 개요

- **프로젝트명**: ChoiTheGenius 기술 블로그
- **기술 스택**: Next.js 15 (App Router), ShadCN, Zustand, Supabase, Milkdown

## 기획 의도

### 🔍 문제점 (Problem)

기존에 사용하던 Velog는 검색이 불편하고, 작성한 자료가 많아질수록 관리가 어려워짐. 이에 학습한 내용을 체계적으로 분류하고, 자료 간의 연관성을 한눈에 볼 수 있는 자체적인 기술 블로그를 구축하고자 함.

### 💡 해결책 (Solution)

> "의식적인 훈련의 주요 목표 중 하나는 자신의 수행능력을 이끌어줄 효과적인 심적 표상을 개발하는 것이다"  
> "일단 견고한 심적 표상의 기초를 세우로 나면, 그로부터 더욱 효과적인 새로운 표상을 스스로 만들어낼 수가 있다."
>
> – 안데르스 에릭슨, 《1만 시간의 재발견》

1. **책 단위 자료 관리**

   - [위키북스](https://wikibook.co.kr), [더북](https://thebook.io)처럼 콘텐츠를 '책' 단위로 관리하여 체계적인 학습 정리

2. **트리 구조 기반 네비게이션**

   - [생활코딩](https://opentutorials.org), [roadmap.sh](https://roadmap.sh/frontend), [Obsidian Graph View](https://obsidian.md)를 참고하여 책과 게시글을 트리 형태로 연결
   - 학습 흐름을 직관적으로 파악할 수 있도록 메인 페이지 구성

3. **강력한 마크다운 에디터**
   - 게시글 작성 및 수정은 [Milkdown](https://milkdown.dev)을 활용한 WYSIWYG 마크다운 에디터 적용
   - [원노트](https://www.onenote.com/) 및 [깃북](https://www.gitbook.com)의 UX를 참고하여 편리한 문서 편집 경험 제공

## 주요 기능

1. **메인 페이지**

   - 게시글을 '책' 단위로 묶어 관리
   - '책'들 간의 연결 관계를 표현 (지식 지도)

2. **카테고리 기반 사이드바 네비게이션**

   - 대분류 → 소분류 → 게시글의 3단계 구조 적용
   - 소분류 클릭 시 동적으로 게시글 목록을 불러오도록 구현
   - 클라이언트 컴포넌트를 사용하되, cache를 이용하여 불필요한 서버요청이 없도록 관리

3. **게시글 뷰어**

   - 사이드바에서 게시글을 선택할 시 메인 섹션이 cached된 서버 컴포넌트로 게시글이 렌더링되도록 구현
   - 트리거(토글 버튼 등)을 사용하여 수정 모드로 즉시 전환
   - 수정 모드는 클라이언트 컴포넌트를 사용하고, Local Storage를 이용한 임시 저장기능 구현.
   - (로그인하지 않은 사용자는 변경 사항이 서버에 반영되지 않도록 필터링)

4. **Next.js + Supabase 연동**

   - PostgreSQL을 백엔드 데이터베이스로 사용
   - Supabase를 활용한 인증 및 데이터 관리

5. **배포 및 운영**
   - Google Cloud Run을 활용한 도커라이제이션 및 배포 자동화
   - 성능 최적화를 위한 SSR(서버사이드 렌더링) 및 SSG(정적 사이트 생성) 적용

## 개발 계획

### 1. MVP 개발

- 기본적인 블로그 레이아웃 및 카테고리 시스템 구축
- Supabase 연동 및 데이터 모델링
- 게시글 작성 및 조회 기능 구현

### 2. 핵심 기능 추가

- 책 단위 관리 및 연결 구조 시각화
- 사이드바 네비게이션 고도화
- 캐싱 및 최적화 작업

### 3. 배포 및 성능 개선

- Google Cloud Run 배포 자동화
- SEO 최적화 및 성능 개선
- 사용자 피드백 반영 및 UI/UX 개선

## 기대 효과

- 단순한 블로그가 아닌, 학습 및 지식 정리를 위한 체계적인 플랫폼 제공
- 기술 스택 및 개발 역량을 포트폴리오에 효과적으로 어필 가능
- 실무 수준의 Next.js 프로젝트 경험 축적

# 개발일지

## 1일차 : Sidebar

주요 기능

- 패널 단위 관리 : OneNote를 벤치마크하는 만큼 각 카테고리를 Panel 단위로 관리한다.
- Collapsed : 패널을 열고 닫을 수 있다. (사이드로 열고 닫으려다가 Layout Shift가 심하여 상하로 열고 닫도록 구현함)
- Zustand와 SSR : 사이드바의 상태를 Zustand로 관리하되, SSR을 통해 초기상태를 설정할 수 있도록 한다.

### Layout

- 각 게시글에 따라 사이드바의 초기 상태를 유지하도록 폴더 구조를 설정하였다.
- 게시글의 Id를 params에서 읽어 사이드바에 넘겨준다.
- 사이드바 내부에 client compoent가 많은 점, 사이드바의 초기 상태를 별도로 구성해야하는 점 등의 이유로 React.Suspense로 분리하여 로딩하도록 하였다.

`app/post/[postId]/layout.tsx`

```tsx
import PostSidebar from "@/components/post/sidebar/post-sidebar";
import PostTopBar from "@/components/post/topBar/post-top-bar";
import { ReactNode, Suspense } from "react";

interface TodoLayoutProps {
  params?: Promise<{ postId: string }>;
  children: ReactNode;
}

export default async function TodoLayout({
  params,
  children,
}: TodoLayoutProps) {
  const postId = (await params)?.postId || "";
  return (
    <main className="w-full h-full flex flex-col">
      <PostTopBar />
      <section className="flex flex-row flex-1">
        <div className="w-64 h-full border-r">
          {/* Sidebar를 suspense로 감싸 로딩을 기다린다. Sidebar의 초기상태를 만들기 위해 postId를 params에서 받아 넘겨준다. */}
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full w-full">
                <div className="spinner"></div>
              </div>
            }
          >
            <PostSidebar postId={postId} />
          </Suspense>
        </div>
        <article className="flex-1 overflow-auto">{children}</article>{" "}
      </section>
    </main>
  );
}
```

### Sidebar Store

카테고리를 '대분류', '소분류', '게시글'로 나눈다고 하였을 때, 이를 효율적으로 관리하기 위해 Zustand가 필요하다.  
이때 Zustand 상태를 Global Store가 아닌 Scoped 방식으로 관리하여야 SSR이 가능해진다.  
[Setup with Next.js - Zustand](https://zustand.docs.pmnd.rs/guides/nextjs)

`hooks/use-sidebar.tsx`, `providers/sidebar-store-provider.tsx`

서버에서 초기 렌더링시에 initialState를 전달하도록 하였다.

```tsx
export const createSidebarStore = (initialState?: Partial<SidebarState>) =>
```

### PostSidebar

`PostSidebar`는 클라이언트 컴포넌트인 `SidebarApp` 컴포넌트에 `SidebarStoreProvider`를 주입하는 서버 컴포넌트이다.

PostSidebar를 서버 컴포넌트로 설정함으로써 React.Suspense를 사용할 수 있고, SSR을 할 때에 SidebarStore에 초기 상태를 설정할 수 있다.

아래의 사항을 염두에 두었다.

1. 주소로부터 `postId`를 전달받아 초기 상태를 로딩한다.
2. 초기 상태를 전달받는 Api Call은 Promise.all로 묶어 로딩 시간을 줄인다.

`components/post/sidebar/post-sidebar.tsx`

```tsx
export default async function PostSidebar({ postId }: PostSidebarProps) {
  const [categories, initialState] = await Promise.all([
    fetchCategories(),
    fetchInitialData(postId),
  ]);

  return (
    <SidebarStoreProvider initialState={initialState}>
      <SidebarApp categories={categories} />
    </SidebarStoreProvider>
  );
}
```

### SidebarPanel

SidebarApp의 주요 구성요소인 패널 컴포넌트이다.  
중복된 코드가 많아져서 하나의 코드로 합치고, panel 타입을 "category", "subcategory", "post"로 나누어 비즈니스 로직이 다르게 동작하도록 구성하였다.

`components/post/sidebar/panels/sidebar-panel.tsx`
