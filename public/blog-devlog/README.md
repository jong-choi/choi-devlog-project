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
- ~~사이드바 내부에 client compoent가 많은 점, 사이드바의 초기 상태를 별도로 구성해야하는 점 등의 이유로 React.Suspense로 분리하여 로딩하도록 하였다.~~ _SSR로 캐싱하기 위해 Suspense 태그 삭제_

`app/post/[postId]/layout.tsx`

```tsx
import PostSidebar from "@/components/post/sidebar/post-sidebar";
import PostTopBar from "@/components/ui/post-top-bar";
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

## 2일차 : Post 스크랩 방안 테스트

### Post 데이터 구조

Post는 velog에 작성했던 글들을 스크래핑할 예정이다.  
Velog의 요청, 응답 데이터 구조는 velog-client 깃허브에서 확인할 수 있다.  
[velog-client/src/lib/graphql - github](https://github.com/velopert/velog-client/tree/master/src/lib/graphql)

본 앱에서 Post의 데이터는 아래와 같이 구성하였다.  
velog의 series는 본 앱의 subcategory에 대응된다.

```gql
  post {
    id
    title
    released_at
    updated_at
    tags
    body
    short_description
    thumbnail
    url_slug
    category {
      id
      name
      url_slug
    }
    subcategory {
      id
      name
      url_slug
    }
  }
```

```JS
const post = {
  id: 'af5b4530-b350-11e8-9696-f1fffe8a36f1',
  title: '상태 관리 라이브러리의 미학: Redux 또는 MobX 를 통한 상태 관리',
  released_at: '2018-09-08T10:19:35.556Z',
  updated_at: '2019-07-30T14:19:14.326Z',
  tags: ['redux', '상태관리'],
  body: '리액트 생태계에서 사용되는 상태 관리 라이브러리는 대표적으로 Redux 와 MobX 가 있습니다. 이 둘의 특징을 배워보고 직접 사용하면서 알아가봅시다.\n\n## 상태 관리 라이브러리의 필요성\n\n상태 관리 라이브러리란게, 과연 필요할까요? 무조건 필요하지는 않습니다. 하지만 한가지는 확실합니다. 규모가 큰 앱에선 있는게, 확실히 편합니다. 제가 존경하는 개발자이면서도.. 리덕스의 라이브러리의 창시자인 Dan Abramov 는 말합니다. ["You might not need Redux"](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367) [(번역)](https://medium.com/@Dev_Bono/%EB%8B%B9%EC%8B%A0%EC%97%90%EA%B2%8C-redux%EB%8A%94-%ED%95%84%EC%9A%94-%EC%97%86%EC%9D%84%EC%A7%80%EB%8F%84-%EB%AA%A8%EB%A6%85%EB%8B%88%EB%8B%A4-b88dcd175754)\n\n실제로, 여러분은 리덕스 없이도 좋은 앱을 만들 수 있습니다. 상태 관리 라이브러리가 없으면, 이전에는 글로벌 상태 관리를 하기에 조금 번거로웠는데 리액트 16.3 에서 [Context API](https://react-context.vlpt.us/03.html) 가 더욱 좋아지면서 글로벌 상태 관리 또한 별도의 라이브러리 없이 할 수 있게 되었습니다.\n\n> 글로벌 상태 관리란, 컴포넌트 간의 데이터 교류, 특히 부모-자식 관계가 아닌 컴포넌트끼리 데이터 교류를 하는것을 의미합니다.\n\n하지만, 그럼에도 불구하고 저는 상태 관리 라이브러리를 결국에는 배워보는걸 권장합니다. 모르고 안 쓰는거랑, 알고 안 쓰는거랑 다르기 때문이죠.',
  short_description:
    '리액트 생태계에서 사용되는 상태 관리 라이브러리는 대표적으로 Redux 와 MobX 가 있습니다. 이 둘의 특징을 배워보고 직접 사용하면서 알아가봅시다.\n\n상태 관리 라이브러리의 필요성\n\n상태 관리 라이브러리란게, 과연 필요할까요? 무조건 필요하지는 않습니다. 하지만 한가지는 확실합니다. 규모가 큰 앱에선 있는게, 확실히 편합니다. 제가 존경하는 개발자이면...',
  thumbnail:
    'https://redux.js.org/img/course-callout-mid.svg',
  url_slug: 'redux-or-mobx',
  category: {
      id: 'adbedb50-1b2f-11e9-958c-cdbdd4063c98',
      name: '필수 라이브러리',
      url_slug: 'frontend-library',
  },
  subcategory: {
      id: '96ffa520-1b2f-11e9-abae-cb5137f530ec',
      name: 'Redux 또는 MobX 를 통한 상태 관리',
      url_slug: 'redux-or-mobx',
  },
};
```

카테고리 목록을 불러왔을 때의 데이터는 아래와 같다.

```gql
    category {
      id
      name
      url_slug
      subcategories {
        id
        name
        posts {
          id
          title
          thumbnail
          short_description
          url_slug
          released_at
        }
      }
    }
```

### Post Scraper 프로그램 작성

scraper 폴더의 index.js 파일로 작성하였다.  
해당 파일은 velog의 https://v2cdn.velog.io/graphql 서비스를 호출하여 게시글의 정보를 가져온다.

(초기에 웹 사이트를 직접 방문하여 크롤링하는 방안으로 구현하였으나, 게시글의 일부 정보가 누락되어 있어 graphql을 직접 호출하는 방안으로 선회하였음.)

```js
import fs from "fs";
const url_slug = "Jest-Jest-작성법";

async function fetchPost(url_slug) {
  const url = "https://v2cdn.velog.io/graphql";

  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    Origin: "https://velog.io",
    Referer: "https://velog.io/",
  };

  const body = JSON.stringify({
    operationName: "ReadPost",
    query: `query ReadPost($username: String, $url_slug: String) {
      post(username: $username, url_slug: $url_slug) {
        id
        title
        released_at
        updated_at
        tags
...
    }`,
    variables: {
      username: "bluecoolgod80",
      url_slug,
    },
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    const data = await response.json();

    fs.writeFileSync(
      "data/" + url_slug + ".json",
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error("Error fetching post:", error);
  }
}

fetchPost(url_slug);
```

## 밀크다운 설치

```
npm install @milkdown/react
npm install @milkdown/kit
npm install @milkdown/theme-nord
```

## 3일차 : Post 스크랩 및 이미지 업로드 1차 구현

### Post 스크랩

`app/api/crawl/[sSlug]/route.ts` 폴더에서 수행한다.

`fetchSeries(url_slug: string)`  
→ 주어진 url_slug를 통해 velog의 시리즈와 해당하는 게시글들을 가져오는 함수. VelogAPIResponse라는 타입으로 반환한다.

`getImageUrls(seriesData: VelogAPIResponse)`  
→ 주어진 seriesData의 게시글들에서 imageUrl을 파싱하여 배열로 반환하는 함수

`uploadImageByUrl(url: string)`  
→ 주어진 이미지 URL을 가져와서 Supabase의 image 스토리지에 업로드하는 함수.

이미지를 업로드한 이후, '시리즈'에 대한 정보를 Supabase의 subcategories 테이블에 row로 추가한다.

이때,

1. 특수 권한이 있는 사람만 DB에 접근할 수 있도록 'service_role key'를 이용해서 service_role로 작동하게 만들었다. 로그인하면 로그인 된 사용자의 role을 따라가기에 로그아웃을 한번하고 로직을 실행한다.

2. subcategories의 id가 uuid로 자동 생성되기 때문에 velog_id라는 text 형태의 추가 아이디를 만들었다. posts 테이블과 연결할 때 유의해야 함.

### 이미지 업로드

`app/api/supabase/upload/route.ts`에서 수행한다.

1. 현재는 velog 주소만 받아서 업로드할 수 있도록 구현 하였다.
2. 반환값으로 public url을 주는 요청/응답을 고려하여 추후 이미지 업로드 기능과 POST 작성 기능을 연동할 때에 이 점에 유의하여 리팩토링한다.

## 4일차 : Subcategory 및 Post 등록

DB의 public.posts, public.subcategories 아래의 정책으로 변경하였다.  
조회 - 누구나 가능  
생성 - 로그인 한 사용자 혹은 서비스 롤
수정, 삭제 - 자신이 생성한 Row 혹은 서비스 롤

### 크롤링한 서브카테고리 등록

`app/api/crawl/[sSlug]/utils/createCrawledSubcategory.ts`

- supabase에 서브카테고리를 생성하는 함수이다.
- velog로 부터 crawl된 series 정보를 받아와서 subcategories 테이블 양식에 맞게 반환한다.
- subcategories에는 velog_id 라는 별도의 id를 만들었다.
- 생성이 완료되면 생성된 subcategory의 id를 반환한다.

### create post 서버액션

`app/post/actions.tsx`
에 create post 액션을 만들었다.
조회할 때에

```
    .limit(1)
    .single();
```

를 쿼리에 붙여주면 배열이 아닌 하나만 반환된다.

### 크롤링한 포스트 등록

`app/api/crawl/[sSlug]/utils/createCrawledPost.ts`

- supabase에 post를 등록하는 함수이다. post를 등록할 때에는 create post 액션을 호출한다.
- 앞서 subcategory를 등록하면서 받은 subcategoryId를 이용하여 foreign key로 subcategory 테이블과 연결한다.
- post를 등록하기 전에 게시글 body를 살피며 supabase에 저장된 이미지의 주소로 이미지 주소를 parsing한다.

### 라우트 핸들러

`app/api/crawl/[sSlug]/route.ts`

다음의 순서로 작동하도록 하여 구현을 마쳤다.

- 시리즈 url_slug를 통해 velog api를 호출하여 해당 시리즈에 포함된 게시글 목록을 불러온다.
- 게시글 목록에서 image들의 url을 호출하여 image를 supabase storage에 업로드한다.
- 시리즈를 supabase DB에 subcategory로 등록한다.
- 게시글을 supabase DB에 post로 등록하고, subcategoryId를 통해 subcategory를 참조한다.

나머지 구현할 것들

- 게시글 작성시에 이미지 업로드 기능
- subcategory, category 업로드 및 수정 기능
  - 게시글에 subcategory 참조하기 기능
  - subcategory에 category 참조하기 기능

### Trouble Shooting

Service Role와 Authenticated가 둘 다 적용되는 경우 에러가 발생한다.

Image를 업로드하는 route handler(`app/api/supabase/upload/route.ts`)는 서비스 롤을 적용하고,
나머지에는 서비스롤을 모두 제거하여 로그인 상태로 글을 작성하도록 하였다.

## 6일차 계획

- template3 일단 레이아웃에 넣고
- template3에 일단 맞춰서 포스트 작성기능 개발하기

### MD 구현

- SSR에서는 조회만, 클라이언트에서 마크다운 에디터 Dynamic import
- "react-markdown"으로 SSR => https://github.com/remarkjs/react-markdown
- "@mdxeditor/editor"로 클라이언트에서 편집 => https://github.com/mdx-editor/mdx-editor-in-next
- "@mdxeditor/editor"를 dynamic-import하면서 ssr을 false로, loading을 react-markdown 컴포넌트로

[➡ Markdown Editor 구현내용으로 이동하기](components/markdown/README.md)

## 7일차 : IndexedDB를 이용한 로컬 자동저장

##### IndexedDB 활용 방안

- 브라우저에 마운트되면 indexedDB를 체크
  - -> 저장된 데이터가 있으면
    - -> indexedDB에 저장된 데이터가 최신 데이터면 : **"브라우저에 임시 저장된 데이터가 있습니다. yyyy.mm.dd hh:mm:ss"** 안내 (반영, 삭제 선택)
- Debounce를 이용하여 입력 내용을 일정 기간마다 indexedDB에 저장 (입력 후 30초가 지나면 저장)
  - -> 자동저장 후 : **"작성중인 내용이 임시 저장되었습니다. yyyy.mm.dd hh:mm:ss"**
- 사용자가 서버에 데이터를 저장 후 : **"저장되었습니다. yyyy.mm.dd hh:mm:ss"**

##### IndexedDB 구조

- Database : "markdown-blog"
- strage : "post"-postId
- keys: timestamp, title, body

##### IndexedDB 컨트롤러 상태 구조

- isUploaded : boolean - 사용자가 이번에 업로드를 했는지 확인 (기본값 false)
- isUploading : boolean - 서버에 저장 중인지 (기본값 false)
- isAutoSaved : boolean - 이번 세션에 자동저장이 된 적이 있는지 확인 (기본값 false)
- isAutoSaving : boolean - IndexedDB에 자동저장 중인지 (기본값 false)
- recentIndexedDbData : { postId : string; data : { timestamp, title, body };} | null - indexedDb에 저장된 최신 데이터 (기본값 null)

### AutosaveStore

초기상태

```tsx
{
  isUploaded: false,
  isUploading: false,
  isAutoSaved: false,
  isAutoSaving: false,
  recentAutoSavedData: null,
}
```

#### AutosaveState 상태 변화에 따른 메시지

1. **최초 마운트 시 혹은 임시저장된 게시글이 없을 시**  
   **AutosaveIndicator:** (메시지 없음)

```tsx
{
  isUploaded: false,
  isUploading: false,
  isAutoSaved: false,
  isAutoSaving: false,
  recentAutoSavedData: null,
}
```

- **설명**:
  - **최초 마운트 시** 아무 데이터도 없는 상태.
  - IndexedDB에 저장된 임시 데이터가 없고, 서버에서 가져온 데이터도 없을 때.

---

2. **서버의 데이터가 최신 데이터일 시**  
   **AutosaveIndicator:** (메시지 없음)

```tsx
{
  isUploaded: false,
  isUploading: false,
  isAutoSaved: false,
  isAutoSaving: false,
  recentAutoSavedData: data,
}
```

- **설명**:
  - IndexedDB에 저장된 데이터가 있지만, **서버의 데이터와 동일**한 상태.
  - 즉, **자동 저장이 실행될 필요 없음**.

---

3. **게시글을 수정해서 자동 저장 실행 중**  
   **AutosaveIndicator:** `"자동 저장 중 입니다."`

```tsx
{
  isUploaded: false,
  isUploading: false,
  isAutoSaved: false,  // 아직 저장되지 않음
  isAutoSaving: true,  // 자동 저장 실행 중
  recentAutoSavedData: data,
}
```

- **설명**:
  - 사용자가 게시글을 수정했고, **디바운스 후 자동 저장이 실행됨**.

---

4. **자동 저장이 완료된 경우**  
   **AutosaveIndicator:** `"자동 저장되었습니다."`

```tsx
{
  isUploaded: false,
  isUploading: false,
  isAutoSaved: true,  // 자동 저장 완료됨
  isAutoSaving: false, // 자동 저장 진행 중 아님
  recentAutoSavedData: data,
}
```

- **설명**:
  - **자동 저장이 완료됨**.
  - **IndexedDB에 저장됨**.
  - 하지만 **아직 서버에는 업로드되지 않음**.

---

5. **서버에 업로드 중인 경우**  
   **AutosaveIndicator:** `"업로드 중입니다."`

```tsx
{
  isUploaded: false,
  isUploading: true,
  isAutoSaved: true,  // 자동 저장된 상태에서 업로드
  isAutoSaving: false,
  recentAutoSavedData: data, // 서버로 보낼 데이터
}
```

- **설명**:
  - 서버로 **최신 데이터를 업로드하는 중**.
  - 이때 `isAutoSaved: true`인 상태에서 업로드가 진행됨.

---

6. **서버에 업로드 완료된 경우**  
   **AutosaveIndicator:** `"업로드 되었습니다."`

```tsx
{
  isUploaded: true,
  isUploading: false,
  isAutoSaved: false,  // 서버에 저장되었으므로 초기화
  isAutoSaving: false,
  recentAutoSavedData: null,  // 업로드 후 IndexedDB에서 데이터 삭제
}
```

- **설명**:
  - **서버 업로드 완료 후 IndexedDB 데이터를 정리**.
  - 더 이상 **자동 저장된 데이터를 유지할 필요 없음**.
  - 이후 사용자가 다시 수정하면 `isUploaded: true → false`, `isAutoSaved: false → true`로 변경됨.

---

### useIndexedDB

`hooks/use-indexeddb.tsx`

- **`addData(storeName: string, data: any): Promise<IDBValidKey>`**  
  → 데이터를 추가하고, 추가된 데이터의 `id`(key)를 반환함.

- **`getData(storeName: string, id: IDBValidKey): Promise<any | undefined>`**  
  → 주어진 `id`의 데이터를 반환하거나, 없으면 `undefined` 반환.

- **`getAllData(storeName: string): Promise<any[]>`**  
  → IndexedDB의 해당 Object Store에 있는 모든 데이터를 배열로 반환.

- **`deleteData(storeName: string, id: IDBValidKey): Promise<void>`**  
  → 특정 `id` 값을 가진 데이터를 삭제하고, 반환값 없음.

- **`clearStore(storeName: string): Promise<void>`**  
  → IndexedDB의 해당 Object Store에 있는 모든 데이터를 삭제하고, 반환값 없음.

- **`getDataByOpenCursor(storeName: string, callback: (data: any) => void): Promise<void>`**  
  → `openCursor()`를 이용해 데이터를 순회하며 `callback` 함수로 각 데이터를 처리, 반환값 없음.

6개의 함수를 지닌 훅을 만들었다.  
아직 IndexedDB에 익숙하지 않아서 JSDoc을 꼼꼼하게 작성했다.

### useDebounce, useAutosaveHandler

`hooks/use-debounce.tsx` : 디바운스를 구현하는 훅
`hooks/use-autosave-handler.tsx` : body, title을 전달받아 useDebounce를 실행하고, debounced되면 autosaveStore의 상태를 변경한다.

### 컴포넌트

- `post-controller/autosave/autosave-indicator.tsx`

  - 자동 저장 상태를 시각적으로 표시하는 컴포넌트
  - "자동 저장 중", "자동 저장 완료" 등의 메시지 표시

- `autosave/autosave-loader.tsx`

  - `dynamic import`를 사용하여 `AutoSaveWrapper`를 비동기 로드
  - SSR을 비활성화하여 클라이언트에서만 실행되도록 설정

- `components/post/post-controller/autosave/autosave-wrapper.tsx`
  - 마운트 시 IndexedDB에서 기존 데이터를 불러와 자동 저장 상태를 복원
  - autosaveStore의 상태에 따라 `useIndexedDB`를 이용해 자동 저장된 데이터를 IndexedDB에 저장 및 로드

## 8일차 : 게시글 자동저장 및 업데이트 테스트

### Trial And Error

시행착오를 너무 많이 겪어서 자동저장 반영하면서 겪은 이슈만 일단정리

- **MDXEditor**

  - MDXEditor가 mounted될 때에는 onChange의 initialMarkdownNormalize가 true로 반환된다. 즉 initialMarkdownNormalize가 false일 때에만 상태변경 함수를 넣어야 한다. setBody를 false일 때 작동하도록 했다.
  - 추가적으로 MDXEditor에 직접 상태를 주입할 때에는 useRef로 MDXEditor가 가진 메서드들을 반환받아 사용하도록 되어 있다. mdxEditorRef를 지정해주었다.

- **MdxEditorWrapper**

  - 초기에 가만히만 있어도 계속 자동저장이 실행되는 문제가 있었는데, MDXEditor의 onChage가 한 번이라도 실행됐었는지를 체크하는 플래그(hasChanged)를 넣어두었다. 문자열 비교도 넣었었는데, 문자열 비교는 제거했다. (자동 저장된 내용과 문자열이 다른 경우가 대부분이라 실사용에서 차이가 없었음.)

- **zustand**

  - SSR을 위해 Provider로 상태를 주입하는 instance-based state를 사용중이었는데, 멍청하게 AutuSaveProvier를 여러개 선언했다. 이런 경우에 서로 상태공유가 안된다.
  - zustand 상태를 객체 형태로 반환하는 과정에서 무한렌더링이 발생하였다. useShallow를 기본적으로 씌우는게 좋다는 사용자들의 의견이 많아서 useShallow를 적용했더니 문제가 사라졌다.

- **use-indexeddb.tsx**
  - 'saved_at'이라는 칼럼을 만든다고 가정하고 indexedDB를 먼저 설계했었는데, zustand에서는 'timestamp'라는 키로 데이터를 관리해버렸다. 'timestamp' 칼럼을 만들도록 대체하였다.
  - 한편 openCursor를 만들기 위해서는 인덱스를 먼저 생성해야 한다!'timestamp'로 인덱스를 생성하는 코드를 추가하였다.

그 밖에 현재 초기상태값, 임시저장된 값, 새로작성한 값을 별도로 구분하지 않고 recentAutoSavedData라는 하나의 상태값으로 조작하고 있다. 이 점에 유의하여 코드를 작성할 것.

### Refactoring

IndexedDB의 구조를 Myblog-postId-{title, body}에서 MyBlog-MyStore-{postId, title, body} 로 변경하도록 리팩토링.  
IndexedDB의 store를 하나로 통합해야 임시저장된 데이터 목록을 한번에 불러오거나, 해당 게시글과 관련된 내용을 전부 삭제하기에 좋다. (store는 삭제가 안된다... ㅠㅠ)
autosave-wrapper와 use-indexeddb를 이에 맞게 수정하였고, 그 과정에서 indexedDB의 재사용성이 많이 떨어졌다.

## 9일차 : 자동저장 게시글 반영, AI 요약 API

### 자동저장게시글 반영하기 기능

- dayjs 설치하였음! lib/date.ts
- 자동저장 게시글 반영을 위해 isLocalDBChecked 추가하였음.

자동저장 indicator 전체적인 ui 개선 필요.

### AI 요약

#### ai_summaries 테이블 생성

1. SUPABASE에 pgvector설치 `CREATE EXTENSION IF NOT EXISTS vector;`
2. ai_summaries 테이블 추가

```sql
CREATE TABLE ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NULL REFERENCES posts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    summary TEXT NOT NULL,
    vector VECTOR(1536),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP DEFAULT NULL
);
```

3. RLS 활성화, REFERENCES에 cacades 등을 설정하고 테이블 생성 완료.
4. RLS 적용

```sql
-- public.posts 테이블에 RLS 정책 적용
create policy "Enable delete for users based on user_id"
on "public".ai_summaries
to public
using (
  (( SELECT auth.uid() AS uid) = user_id)
);

create policy "Enable insert for authenticated users only"
on "public".ai_summaries
to authenticated
with check (
  true
);

create policy "Enable update for users based on user_id"
on "public".ai_summaries
to public
using (
  (( SELECT auth.uid() AS uid) = user_id)
)
with check (
  (( SELECT auth.uid() AS uid) = user_id)
);

create policy "Enable read access for all users"
on "public".ai_summaries
to public
using (
  true
);
```

#### chatgpt api 작성하기

1. openai api keys 생성 - [https://platform.openai.com/settings/organization/api-keys](https://platform.openai.com/settings/organization/api-keys)
2. .env에 `OPENAI_API_KEY=sk-proj****`로 저장
3. app/api/summary/route.ts 에 chatgpt api를 프롬프트와 예시를 통해 작성

#### 서버에 요악된 정보를 작성하는 server action 작성

`app/post/actions.tsx/createAISummary`
이때 `VECTOR(1536)`은 `number[]` 타입이어야 하는데 supabase:gen으로는 이것이 반영이 안되어서 omit으로 덮어 씌워줬다.

#### 기존 crawl 코드 수정

`app/api/crawl/[sSlug]/utils/createCrawledAISummary.ts`를 통해 open ai api를 호출하여 요약정보를 받고,  
요약된 정보를 server에 업로드하도록 하였다.

해당 createCrawledAISummary 함수는 `app/api/crawl/[sSlug]/utils/createCrawledPost.ts`에서 promise.all로 감싸 실행되도록 하였다.

## 10일차 : 카테고리 및 요약 조회기능 + DND 구상방안

### Server Action

Server Action을 작성하고
Server Action을 캐싱할 때 사용할 유틸함수들을 구현하였다.

`utils/nextCache.tsx`

- CACHE_TAGS : Tags를 생성하는 팩토리 함수이다. 정확히는 Tag의 앞부분인 key를 생성한다.
- createCachedFunction : Server Action 함수를 감싸는 wrapper 함수이다. ServerAction의 args를 조회하여, 첫번째 인자를 Tag의 뒷부분에 넣어 Tag를 만든다.

Wrapper 함수로 미들웨어처럼 사용해보려 했는데, 사용할 일이 많지 않았다.

#### Server Action Wrapper 리팩토링

`createWithInvalidation`
createWithInvalidation을 리팩토링하여 타입을 선언하고 1번 인자로 server측 함수, 2번 인자로 서버측 함수의 결과를 받아서 revaildate를 실행하는 함수를 작성하도록 리팩토링 하였다.

#### Params 리팩토링

- slug에 'postId'로 담던 것을 'urlSlug'로 변경하였다.
- 이에 따라 useParams로 postId를 가져오던 컴포넌트들은 Zustand에서 SSR된 postId를 가져오도록 하였다.
- `hooks/use-postId.tsx` 커스텀 훅도 만들었으나, 코드가 깔끔해지는 장점은 있으나 마운트 될 때마다 서버로 요청이 가서 부적절. 초기 상태를 지정할 때에는 SSR 상태를 Zustand나 props로 저장하는 편이 효율적으로 보인다.

### Floating Order

DND를 구현하려고 했는데, 같은 카테고리에 있는 다른 객체들의 order도 함께 수정해야 하는 상황이 발생하였다.  
그래서 Floating Order라는 방식을 찾아 order를 큰 수로 지정하였다.

1000, 2000 사이에 객체를 집어넣으면 order를 (1000+3000)/2인 1500으로 지정하는 방식이다.

> 보통 정수 기반 정렬(1, 2, 3, ...) 방식과 달리, 실수(100.5, 150.75 등) 또는 큰 간격의 정수(100000, 200000, ...)를 사용하여 유연한 삽입을 가능하게 만듭니다.

order사이의 간격이 촘촘해지면 `Rebalancing`을 해야하지만, 64bit 실수로 저장하고 있기 때문에 실사용에서는 발생하지 않을 것으로 판단한다.

## 11일차 :로그인 및 사이드바 개발

### 보안

핀 번호를 입력해야 로그인이 가능하도록 하고 pin 번호는 서버 측에 저장하도록 했다.  
이후 사용자 정보를 확인하여 처리할 수 있도록 Auth Store를 만들었다.

사용자 정보를 확인 후 처리할 때에는 민감하지 않은 정보만 .env에 담아 관리하도록 했다.

### Sidebar 개발

#### 타입 수정

```ts
export type Post = {
  id: number;
  title: string;
  url_slug: string;
  short_description: string;
  is_priave;
  order: number;
};
export type Subcategory = {
  id: number;
  name: string;
  order: number;
};

export type Category = {
  id: number;
  name: string;
  order: number;
  subcategories: Subcategory[];
};
```

필요한 필드를 더 추가하고 subcategory에 posts[]를 넣는 부분을 제외했다.

#### 카테고리 전체 정보 불러오는 쿼리

postgrest를 이용해 데이터를 불러온다.

카테고리 정보는 자주 바뀌지 않으니 한번에 불러온다.

```
categories : [
  {
    id,
    name,
    order,
    subcategories : [
      id,
      name,
      order
    ]
  }
]
```

```tsx
const { data, error } = await supabase
  .from("categories")
  .select(
    `
    id,
    name,
    order,
    subcategories:subcategories (
      id,
      name,
      order
    )
  `
  )
  .order("order", { ascending: true }) // categories 정렬
  .order("order", { foreignTable: "subcategories", ascending: true });
```

foreignTable 이라는 기능이 없다길래 아래와 같이 일단 수정

```tsx
await supabase
  .from("categories")
  .select(
    `
  id,
  name,
  order,
  subcategories (
    id,
    name,
    order
  )
  `
  )
  .order("order", { ascending: true }) // categories를 order 기준으로 정렬
  .select("id, name, order, subcategories!inner(id, name, order)")
  .order("order", { ascending: true, referencedTable: "subcategories" });
```

#### 서브카테고리의 글 목록을 불러오는 쿼리

type Post = {
id: number;
url_slug: string;
title: string;
short_description: string;
is_private: boolean
order: number;
};

posts 테이블에서 선택한다.
subcategoryId를 받아서 posts.subcategory_id가 일치하면 가져온다.
order를 기준으로 오름차순 정렬한다.

```ts
const { data, error } = await supabase
  .from("posts")
  .select("id, url_slug, title, short_description, is_private, order")
  .is("deleted_at", null)
  .eq("subcategory_id", subcategoryId)
  .or(isValid ? "" : "is_private.is.null")
  .order("order", { ascending: true });
```

#### url_slug를 기반으로 게시글을 불러오는 쿼리

이번엔 urlSlug가 있을 때 데이터를 반환받는 예시이다.

```tsx
let query = supabase
  .from("posts")
  .select(
    `
    id,
    url_slug,
    title,
    short_description,
    is_private,
    subcategories (
      id, name, order
      categories ( id, name, order )
    )
  `
  )
  .eq("url_slug", urlSlug)
  .is("deleted_at", null);

if (!isValid) {
  query = query.or("is_private.is.false,is_private.is.null");
}

const { data, error } = await query.maybeSingle();
```

```
{
  "url_slug": "typescript-basics",
  "id": 2,
  "title": "TypeScript 기초",
  "short_description": "TypeScript의 핵심 개념을 학습해 보자.",
  "subcategories": {
    "id": 12,
    "name": "Frontend",
    "order": 2,
    "categories": {
      "id": 100,
      "name": "Web Development",
      "order": 1
    }
  }
}
```

### 드래그 앤 드롭 구현

components/post/sidebar/panels/dnd-sortable-list.tsx

### 기타

- Server Action에서 이번에 새로 작성한 sidebar 관련 태그들 invalidate하는 로직 추가할 것.
- 포스트 선택 후 밑이 허전하니까 추천 게시글 목록 쭉 띄우기

## 12일차 게시글 CRUD 워크플로우 + 인공지능 기능 구현

- 사이드바에서 카테고리 생성
- 사이드바에서 게시글 생성
- 새 게시글이 생성되면 해당 페이지로 이동
- 게시글 상단 breadcomb에서 카테고리, 게시글 url-slug 변경 가능
- 게시글 우측 ai 요약 단에서 ai 요약 생성 가능

생성 기능

- 새 카테고리를 누르면 이름을 입력하는 dialog가 생성되고, 생성한다.
- 새 글을 누르면, post/new로 이동되고, 카테고리 정보는 불러오고, url_slug와 기타 내용은 직접 입력한다.

### 추천 게시글 API 작성

`app/api/summary/recommended/route.ts` 작성.  
ai summary의 vector 값을 불러와서 코사인 유사도를 분석한다.
새로운 게시글을 수정 완료했을 때에만 실행한다.

### 추천 게시글 보기 및 인공지능 요약 보기

미뤄뒀던 게시글 보기 및 인공지능 요약 보기를 연동하였다.  
사이드바 패널에 "recommended" 패널 타입을 추가하고, recommended 상태일 때 추천 게시글을 보도록 하였다.  
인공지능 요약은 `app/post/[urlSlug]/page.tsx`의 우측에 새로운 inset 패널을 추가하였다. 기존 react-markdown-wrapper를 재사용하려 했지만 여의치 않아서 새로운 ai-markdown-wrapper륾 만들고 스타일을 새로 적용하였다.

### 게시글 업데이트

게시글 생성 방안에 대해 고민하다가, 업데이트 된 게시글을 서버에 반영하는 것부터 시작하는 것으로!  
게시글 생성은 url_slug가 유효하지 않을 때 초기 state가 null인 것을 이용하도록 한다. 따라서 게시글 업데이트부터 완성시키는 것이 필요.

현재 supabase의 posts 테이블은 아래와 같은 타입을 지닌다.

```tsx
        Insert: {
          body?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_private?: boolean | null
          order?: number | null
          released_at?: string | null
          short_description?: string | null
          subcategory_id: string
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          url_slug: string
          user_id?: string | null
          velog_id?: string | null
        }
```

이 중 사용자가 직접 입력할 데이터들은 아래와 같다.

```tsx
          body?: string | null
          is_private?: boolean | null
          released_at?: string | null
          short_description?: string | null
          subcategory_id: string
          thumbnail?: string | null
          title: string
          url_slug: string
```

recentAutoSavedData에서 body와 title을 가져올 수 있다.
url_slug는 Params에서 가져오고, 없으면 title를 파싱한다.
thumbnail은 body에서 발견한 이미지의 링크를 저장한다.

```tsx
function extractFirstImageFromText(postText, commonImagePath) {
  const regex = new RegExp(
    `!\\[.*?\\]\\(((${commonImagePath}[^\\s)]+))\\)`,
    "i"
  );
  const match = postText.match(regex);
  return match ? match[1] : "";
}

const postText = `
지난시간까지 만들었던 페이지들의 애니메이션을 일부 수정했다.
![](https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image/post/d6ccc8aa-b191-4b6b-82ad-713151d6871e/image.gif)
기존에는 스크롤 효과를 대체하기 위해서 만든 애니메이션이었는데...
`;

const commonImagePath =
  "https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image";
const firstImageUrl = extractFirstImageFromText(postText, commonImagePath);
```

released_at은 now()로 설정.
subcategory_id는 서버에서 가져온 값을 기본으로 하되 수정이 가능하게 한다.
short_description는 바디에서 글자룰 추츨
is_private은 false로 둔다.

이후 업로딩 다이알로그에서
subcategory_id, short_description, is_private, url_slug를 수정하게 한다.

#### 업로딩 다이알로그

`components/post/post-controller/post-uploading-dialog.tsx`
Shadcn에서 기본적으로 다이알로그가 다 만들어져 있어서 쉽게 구현했다.  
AutosaveStore에 Draft라는 상태를 만들었고,
AutosaveStore에 PostId가 없는 경우, 유효하지 않은 URL_SLUG인 점에서 착안해 Create로 작동하도록 하여 생성과 업데이트 모두 구현하였다.

#### Server Action

일전에 Server Action에서 unstable_cache를 사용할 수 없는 문제가 있어 클라이언트용 슈퍼베이스 클라이언트로 모두 변경하였는데, JWT 토큰을 받지 못한다.  
이를 해결하기 위해 Create, Update, Delete는 서버 측 클라이언트로 변경하고, Read 관련된 Action만 클라이언트 용으로 변경하였다.

또한 URL_SLUG에 IS_UNIQUE 설정을 반영하였는 바, URL_SLUG의 중복을 방지하는 함수도 만들었다.

```ts
// url_slug 중복 방지
const generateUniqueSlug = async (
  supabase: SupabaseClient,
  baseSlug: string
) => {
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const { data } = await supabase
      .from("posts")
      .select("id")
      .eq("url_slug", slug)
      .limit(1);

    if (!data || data.length === 0) break; // 중복되지 않으면 사용 가능

    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};
```

like와 set자료형을 통해 한 번만 DB를 호출하도록 변경하였다.

```ts
export const generateUniqueSlug = async (
  supabaseClient: SupabaseClient,
  baseSlug: string
) => {
  const supabase = supabaseClient || createClientClient();

  const { data, error } = await supabase
    .from("posts")
    .select("url_slug")
    .like("url_slug", `${baseSlug}%`);

  if (error) {
    throw new Error("Error fetching slugs from the database");
  }

  if (!data || data.length === 0) return baseSlug;

  const existingSlugs = new Set(data.map((row) => row.url_slug));

  let count = 1;
  let slug = baseSlug;

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};
```

#### 글 생성 버튼

`components/post/create-post-button.tsx`

앞서 만든 generateUniqueSlug로 아이디어를 얻어 없는 url_slug로 보내려고 했는데,
generateUniqueSlug를 호출하는 시간이 꽤 길었다.

그래서 랜덤한 영어 단어를 만들어주는 라이브러리를 이용하여 무작위 영어단어를 두 개 넣어서 url_slug를 만들도록 했다.

#### 인공지능 요약 생성

`components/post/ai-summary.tsx`
summary가 존재하는지 여부만 체크하면 돼서 금방 끝났다.

한편 로그인 여부, 인공지능 글 생성 여부, 추천 게시글 목록 생성 여부에 따라서 보여지는 메시지가 달라질 수 있도록 하였는데, 그 과정에서 여러가지 버그들을 찾아서 고칠 수 있었다. 특히 `utils/nextCache.tsx` 이 파일에서 tags가 제대로 생성되지 않고 있는 걸 발견해서 다행이다.

### 보안 기능 강화

먼저 Auth Store를 로컬 스코프로 변경했다.

이후 Unstable_cache에 대해 고민하다가, 로그인 된 상태로 SSG를 하면, 해당 내용을 로그인되지 않은 사람도 볼 수 있는 것 아닌가 고민했다.
...그리고 테스트해보니 그게 맞았다. 로그인 된 상태에서 private한 데이터를 보려면 캐시를 하지 않고 SSR로 작동되도록 해야한다.

결국 서버단에서 쿠키를 읽고 처리해줘야 하는 문제라서 여러가지 방법을 고민하다가,  
Wrapper 함수가 서버단 함수라는 걸 뒤늦게 깨달아서 Wrapper 함수 내부에서 cookies()를 호출하게 되었다.

crud 중에서 c,u,d도 요청 단에서 캐시스토어와 cli를 넘겨주는 방법을 찾아보면 좋을 듯.

## 13, 14, 15일차 - 정신과 시간의 디자인

### 에디터 교체

기존 MDXEditor에서 milkdown/crepe로 에디터를 교체했다.  
MDXEditor와 remark/react-markdown 사이에 스타일링이 지속적으로 꼬이는 문제가 있었는데, code-mirror가 마운트되면서 클래스명을 전부 교체하기 때문이었다.  
또 테스트 도중 상호작용 등에서도 문제가 발생했다.

milkdown/crepe로 에디터를 교체하였고, milkdown/kit에 비해 문서가 적은게 단점이지만, 추상화가 잘 되어 있어서 전체적인 코드량이 줄어들고 버그도 없었다.

#### Codemirror 줄바꿈 이슈 해결

전체적으로 레이아웃을 갈아 엎어야겠다고 다짐했던 이유가 milkdown/crepe가 마운트되고 나서 글 편집 섹션의 크기가 마구잡이로 넓어지는 이슈였다.

디자인을 다 갈아엎고 보니 codemirror 익스텐션 설정만 바꿔주면 되는 문제였다.

```tsx
        [Crepe.Feature.CodeMirror]: {
          extensions: [EditorView.lineWrapping],
        },
```

### CSS 디자인 배운 점

#### 스크롤

특정 요소만 스트롤하는 문제로 골머리를 앓았다.

스크롤을 할 때에 "h-screen"이나 고정값들은 최대한 제외하면서 작성하는게 맞다고 생각했는데,  
결과적으로 최상위 부모요소에는 "h-screen"을 명시적으로 선언하는 것이 좋다.

그 이후에 자식 요소들이 고정값을 받아가야 해당 자식요소에서만 overflow가 적용되는데,  
자식 요소들에게 고정 높이값을 넘겨줄 때에는

1. 최상위 요소 : h-screen으로 고정값 지정
2. 자식 요소가 한개일 때 : h-full로 상속
3. 자식 요소가 2개일 때 : **하나는 고정값**, 나머지 하나는 flex-1으로 확장
4. 자식 요소가 3개 이상일 때: grid를 쓰거나 flex박스 안에 flex를 겹처 넣는다.

고정값을 피하려고만 하면 원하는 ux가 안나오니 필요할 때에는 과감히 고정값을 쓰자.

#### 다크 모드

다크 모드를 지정하는데에 생각보다 오래 걸리지 않았다.

1. tailwind : 테일윈드의 tailwind.config.ts에는 darkMode가 "class"로 지정되어 있는데, 다크모드가 감지되면 class를 넣어주는 방식은 컴포넌트가 마운트된 후 넣어주는 것이기 때문에 SSR도 안되고 깜빡임도 있었다. darkMode: 'media'로 변경하는 것이 성능에는 더 좋았다.
2. 기본 폰트색이랑 기본 배경색을 정해놓고, 부모 요소에서 지정했으면 자식 요소에는 배경색이나 폰트색을 지정하지 말자. 부모 요소 설정을 따라간다. 중간 중간 하드코딩으로 색상 지정하게되는 경우가 있는데, 그런 경우에는 발견하는대로 지우자.

#### text-shadow

tailwind에 없는 기능 중에 text-shadow가 있다.  
text-shadow를 적용하면 얇은 폰트, 작은 폰트가 미묘하게 두꺼워보이면서 가독성이 좋아지고 세련되게 보인다.

사이드바의 폰트 사이즈를 줄이도 text-shadow를 적용했더니 내가 원하는대로 미묘하게 두꺼워진 폰트를 볼 수 있었다.
폰트 크기를 14, 12까지 줄이는 것이 접근성에 안좋다고는 하지만~ 이쁘면 그만이야~

### Next.js searchParams

1. next.js의 layout에서는 searchParams를 받아올 수 없다. page에서만 가능하다.
2. searchParams는 받더라도 어짜피 SSG가 아닌 SSR로만 작동한다. searchParams를 통한 성능 최적화에는 한계가 있다.... 그래서 searchParams를 받아서 사이드바 초기 상태를 설정하기 구현을 포기하고 그냥 useEffect로 처리했는데, 잘 작동한다.

## 16, 17일차 - 게시글 데이터 분석 (DBSCAN)

애초에 블로그를 포크하기로 한 이유가 게시글들을 정확히 분류하고 분석하기 위함이었기 때문에...

### 데이터 분석 초안

내가 원하는 것은 게시글을 분류하고, 분류들 간의 관계성을 나타내는 것이다.

직접 수작접으로 할 수 있지만, 123개를 직접 하는게 어렵기도 하거니와 기준도 명확하게 떨어지지 않는다.

gpt-4o, text-embedding-3-large를 이용해서 간단한 코사인 분석 및 군집화를 하기로 한다.

복잡하게 생각할 것 없이 간단하게 접근하기로 했다.

1. 게시글 요약 생성 (구현 완료) - **summaries**
2. 요약된 게시글에 대한 embedding vector 생성 (현재 text-embedding-2를 쓰고 있는데 3-small 모델로 변경할 것) **summary-vectors**
   1. text-embedding-3-large가 가격도 저렴하고 날 것 그대로를 임베딩하여 군집화하기 좋다고 함.
3. summary-vectors를 코사인 유사도 분석하여 유사도 0.n 이상인 관계들을 DB에 저장. **post-similarities**
   1. 유사도 기준치를 무엇으로 하냐에 따라서 edges 수가 달라짐
   2. 적정 edges는 최대 edges의 7%~20%가 적정 edges
   3. 따라서 글 120개 기준, `(120*120)/2` = 7200
   4. `500개(7200 * 0.07)`~`1500개(7200*0.2)` 사이가 되도록 유사도 기준치를 정할 것. (edges가 너무 많으면 게시글이 뭉태기로 뭉쳐짐)
4. Louvain 알고리즘을 이용하여 군집화를 하고, 각 군집의 vector 평균들을 db에 저장 **clusters**, **cluster-vectors**
   1. threshold에 따라서 군집의 갯수가 달라지니 테스트 해보면서 threshhold를 찾아보고, 확정되면 constants로 저장해둘 것!
5. cluster-vectors를 코사인 유사도 분석하여 db에 저장. **cluster-similarities**
6. (마무리) clusters별로 summaries를 불러와 chatgpt한테 적절한 culster 이름을 지어달라고 함. **clusters.name**

```
[post1]  \
[post2]   -> cluster 1  -> mean vector → similarity with cluster 2: 0.81
[post3]  /

[post4]  \
[post5]   -> cluster 2  -> mean vector → similarity with cluster 1: 0.81
```

....이 이야기를 chatgpt한테 들려줬더니 주제 추론 파이프라인 방식이라는데 나는 그게 뭔지 모른다.

cluster-sims를 화면에서 그래프 형태로하여 보여주면 된다.

### 데이터 분석 구현

#### 인증 확인

`utils/api/supa-utils/supaValidCheck` : 현재 사용자가 확인된 사용자면 true를 반환하도록 한다.

#### view테이블 리팩토링

`post_similarities` 테이블이 양방향으로 데이터가 저장되며, 나머지 정보들도 비정규화되어 들어가 있다. 단방향으로 저장하되, 똑같은 출력값이 나오도록 `post_similarities_with_target_info` 뷰를 만들었다.

```sql
DROP VIEW IF EXISTS post_similarities_with_target_info;

CREATE VIEW post_similarities_with_target_info AS
SELECT
  ps.source_post_id AS source_post_id,
  ps.target_post_id AS target_post_id,
  p_target.title AS target_title,
  p_target.url_slug AS target_url_slug,
  p_target.thumbnail AS target_thumbnail,
  ps.similarity AS similarity
FROM post_similarities ps
JOIN posts p_target ON ps.target_post_id = p_target.id
WHERE p_target.deleted_at IS NULL
  AND (p_target.is_private IS DISTINCT FROM true)

UNION

SELECT
  ps.target_post_id AS source_post_id,
  ps.source_post_id AS target_post_id,
  p_source.title AS target_title,
  p_source.url_slug AS target_url_slug,
  p_source.thumbnail AS target_thumbnail,
  ps.similarity AS similarity
FROM post_similarities ps
JOIN posts p_source ON ps.source_post_id = p_source.id
WHERE p_source.deleted_at IS NULL
  AND (p_source.is_private IS DISTINCT FROM true);
```

그 다음 post_sims 테이블에는 source_post_id < target_post_id 이도록 제약조건을 걸어준다.

```sql
DELETE FROM post_similarities;

CREATE UNIQUE INDEX unique_similarity_pair
ON post_similarities (source_post_id, target_post_id);

ALTER TABLE post_similarities
ADD CONSTRAINT enforce_sorted_pair
CHECK (source_post_id < target_post_id);
```

#### 코사인 유사도 업데이트

`app/api/similarity/generate/route.ts`
코사인 유사도를 삽입하는 route hanlders를 만들었다.

유사도를 삽입하니 기존 text-embedding-2에 비해 확실히 넓게 분포하는 것을 확인할 수 있었다.

view 테이블에는 유사한 게시글 10개만 조회되도록 변경하고 마무리

```sql
DROP VIEW IF EXISTS post_similarities_with_target_info;

CREATE VIEW post_similarities_with_target_info AS
SELECT
  source_post_id,
  target_post_id,
  target_title,
  target_url_slug,
  target_thumbnail,
  similarity
FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY source_post_id
      ORDER BY similarity DESC
    ) AS rn
  FROM (
    SELECT
      ps.source_post_id AS source_post_id,
      ps.target_post_id AS target_post_id,
      p_target.title AS target_title,
      p_target.url_slug AS target_url_slug,
      p_target.thumbnail AS target_thumbnail,
      ps.similarity AS similarity
    FROM post_similarities ps
    JOIN posts p_target ON ps.target_post_id = p_target.id
    WHERE p_target.deleted_at IS NULL
      AND (p_target.is_private IS DISTINCT FROM true)

    UNION

    SELECT
      ps.target_post_id AS source_post_id,
      ps.source_post_id AS target_post_id,
      p_source.title AS target_title,
      p_source.url_slug AS target_url_slug,
      p_source.thumbnail AS target_thumbnail,
      ps.similarity AS similarity
    FROM post_similarities ps
    JOIN posts p_source ON ps.source_post_id = p_source.id
    WHERE p_source.deleted_at IS NULL
      AND (p_source.is_private IS DISTINCT FROM true)
  ) unioned
) sub
WHERE rn <= 10;
```

#### 태그 테이블 생성

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

태그와 post가 N:M 관계로 만나도록 했다.

태그를 생성하는 API Route Handlers는 app/api/summary/tags/route.ts에 작성하였다. 128개의 게시글에서 384개의 태그에 대해 658개의 조회가 일어났으니 중복된 태그는 많이 사라진듯? 일단 이 상태로 그대로 써보고 불필요한 태그가 너무 많으면 view 태이블에서 참조가 1번 밖에 없는 태그들은 제거하는 방향으로 가야겠다.

##### 태그 생성 액션

태그 생성 액션은 createTagsByPostId를 통해 app/api/summary/tags/route.ts를 호출하도록 한다. 하나만 호출할 때에는 payload를 같이 주고, 그렇지 않은 경우에는 기존처럼 전체를 다 확인하게 된다.

#### DBSCAN

DBSCAN을 했는데 결과가...

```
    // 엡실론 0.3, minSamples=4일때 군집된 게시글 수: 12, 군집 결과: [4,4,4].
    // 엡실론 0.4, minSamples=4일때 군집된 게시글 수: 72, 군집 결과: [49,8,3,4,4,4].
    // 엡실론 0.35, minSamples=4일때 군집된 게시글 수: 39, 군집 결과: [4,25,6,4].
    // 엡실론 0.37, minSamples=4일때 군집된 게시글 수: 48, 군집 결과: [33,5,6,4].
    // 엡실론 0.35, minSamples=4일때 군집된 게시글 수: 39, 군집 결과: [4,25,6,4].
    // 엡실론 0.4, minSamples=2일때 군집된 게시글 수: 86, 군집 결과: [55,9,4,2,6,2,2,4,2].
```

next js 관련해서만 55개가 묶이고 나머지는 짜잘이들이다.  
또 한가지 큰 문제가, 군집화가 되지 않은 게시글 중에서도 React와 JavaScript 관련해서 중요한 내용이 많은데 제외되어 있다는 것이다.  
크게 군집화된 군집을 후처리로 쪼개더라도 이렇게 군집화가 안된 noise들은 처리를 할 수가 없다.

그래서....다단계로 엡실론을 높여가면서 묶도록 하였다.

일단 앱실론을 0.33으로 뒀을 때의 결과값은 만족스러워 그대로 두기로 햇다.

```
엡실론 0.33, minSamples=4일때 군집된 게시글 수: 27, 군집 결과: [12,6,5,4].
```

이후 0.33부터 차근차근 엡실론을 높여가며 살펴본다.

```
    const epsilons = [
      // 고밀도
      0.33, 0.34, 0.35,

      // 중간 밀도 (간격 넓힘)
      0.37, 0.39, 0.41,

      // 느슨한 군집 (0.04 간격)
      0.44, 0.48, 0.52, 0.56, 0.6,

      // 끝물
      0.65, 0.7, 0.75,
    ];
    const MIN_SAMPLES = 4;
```

```
  "count": 21,
  "군집된 게시글 수": 126,
  "군집 결과": [
    12,
    6,
    5,
    4,
    4,
    8,
    4,
    4,
    7,
    6,
    4,
    6,
    12,
    15,
    4,
    3,
    5,
    4,
    5,
    4,
    4
  ],
```

4보다 높은 군집이 중간중간 형성되고, 군집된 게시글도 126개로 거의 다 군집이 된 것으로 보인다.

중간중간 불만족스러운 클러스터들이 있지만 chatgpt로 한 번 걸러서 군집끼리 연결지을 것이기 때문에 패스.

#### CHATGPT로 군집 요약 및 벡터 추출

"@/app/api/similarity/cluster/generate/utils/generateClusterTitleAndSummary";

결과는 아래와 같은 객체가 나온다.

```
{
        "title": "자바스크립트 디자인 패턴",
        "summary": "이 군집은 'Node.js 디자인 패턴 바이블'을 중심으로 자바스크립트 디자인 패턴과 브라우저 작동 원리를 학습하는 과정에 대해 다룹니다.",
        "keywords": [
          "javascript",
          "design pattern",
          "node js",
          "browser",
          "typescript"
        ],
        "vector": [
          -0.042979337,
          0.009054751,
          0.0050087934,
          -0.0131416805,
          0.046543878,
          -0.03462111,
          -0.015395125,
          0.017105695
        ]
      }
```

#### 군집 DB

형성된 군집들을 저장하는 DB를 아래와 같이 만든다.

```sql
create table clustered_posts_groups (
  id uuid primary key default gen_random_uuid(),
  title text,
  summary text,
  keywords text[],
  vector vector(1536),
  quality integer,
  post_ids uuid[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

이를 삽입하는 데이터 supabase 쿼리를 아래와 같이 만든다

```
    const { data: insertIds, error: insertError } = await supabase
      .from("clustered_posts_groups")
      .insert(
        //@ts-expect-error: vector 타입 불일치 예상
        allClusters.slice(0, 1).map((cluster) => ({
          title: cluster.result.title,
          summary: cluster.result.summary,
          keywords: cluster.result.keywords,
          vector: cluster.result.vector,
          quality: cluster.quality,
          post_ids: cluster.post_ids,
        }))
      )
      .select("id, vector"); //
```

#### 군집 DB 코사인 유사도

아래와 같이 코사인 유사도를 저장할 단방향 테이블을 만든다.

```sql
create table clustered_posts_groups_similarities (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references clustered_posts_groups(id) on delete cascade,
  target_id uuid references clustered_posts_groups(id) on delete cascade,
  similarity float8 not null,
  created_at timestamp with time zone default now()
);

CREATE UNIQUE INDEX unique_groups_similarity_pair
ON clustered_posts_groups_similarities (source_id, target_id);

ALTER TABLE clustered_posts_groups_similarities
ADD CONSTRAINT enforce_sorted_pair
CHECK (source_id < target_id);
```

### 군집 API 완성본

`app/api/similarity/cluster/generate/route.ts`

1. `ai_summaries`에서 벡터 데이터를 가져온다.
2. DBSCAN에 적합하게 vectors, postIds, summaries 배열로 평탄화한다.
3. epsilons배열로 설정한 순서에 따라서 epsilon을 높이며 DBSCAN을 한다.
4. 이때 군집이 형성되면 chatgpt와 text-model-embedding-3-small을 호출하여 해당 군집의 이름, 한줄 요약, 키워드, 이에 따른 1536차원 벡터를 생성하여 저장한다.
5. 생성된 군집을 `clustered_posts_groups` 테이블에 저장한다.
6. 군집 간 코사인 유사도를 `clustered_posts_groups_similarities` 테이블에 저장한다.

text-model-embedding-3-small로 했음에도 불구하고 가격이 많이 나왔다...

3달러에 테스트 완료.

## 18, 19일차 - D3, SSR, JSDOM

### D3 서버사이드 렌더링하기

https://brunch.co.kr/@993679fb217e4e4/1
해당 브런치에 JSDOM을 이용해서 SSR을 하는 패턴이 잘 요약되어 있다.

기본적으로 React에서 D3를 이용하는 패턴은 아래와 같다.

```tsx
"use client"
export default function D3App({data}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(()=>{
    if(!ref.current) return
    const svg = d3.select(ref.current).appent('svg';)
    ....
    const rects = svg.querySelectorAll("rect");

    rects.forEach((rect, i) => {
      // 클릭 이벤트 추가
      rect.addEventListener("click", () => {
        router.push(`/tags/${label}`);
      });
    });
  },[]);

  return <div ref={ref}/>
}
```

이를 JSDOM을 이용해 html 형태로 반환하면 SSR이 작동한다

```tsx
export default function D3App({ data }) {
  const document = new JSDOM(`<html><body></body></html>`).window.document;
  const body = select(document.body);
  const svg = body.append("svg");

  return <div dangerouslySetInnerHTML={{ __html: body.html() }} />;
}
```

단, 이렇게 하는 경우 onClick과 같은 자바스크립트 기반의 상호작용은 작동하지 않는다.

이에 자바스크립트를 hydration하는 코드를 별도록 클라이언트 컴포넌트에서 작동하게 한다.

```tsx
"use client";

export default function D3AppHydrator() {
  const router = useRouter();

  useEffect(() => {
    // 서버에서 렌더된 SVG 요소
    const svg = document.querySelector("svg");
    if (!svg) return;

    const rects = svg.querySelectorAll("rect");

    rects.forEach((rect, i) => {
      // 클릭 이벤트 추가
      rect.addEventListener("click", () => {
        router.push(`/tags/${label}`);
      });
    });
  }, [router]);

  return null;
}
```

이렇게 하면 빌드타임에서 D3App를 Static한 파일로 만들기 때문에 배포 후에는 D3App이 즉시 로딩되는 것을 볼 수 있다.

### 군집 그래프 작성하기

`components/cluster/graph/cluster-graph-svg.tsx` 클러스터 그래프를 ssr한다. 최초 로딩시에는 그래프를 시뮬레이션하느라 오래 걸리지만, 빌드를 하고 나면 그대로 고정된다.

`components/cluster/graph/cluster-graph-hydrator.tsx` csr을 통해 생성된 SVG에 이벤트를 삽입시킨다. 버튼을 누르면 선택된 버튼이 변경되는 등.

`components/cluster/graph/cluster-graph.css` 클래스명을 기반으로 디자인 한다. 선택되는 등의 경우에 클래스명이 변경된다.

`app/map/actions.tsx` 군집의 데이터, 군집간 유사도를 가져오는 서버 액션. 자주 바뀌는 데이터가 아니라서 cluster라는 별도의 태그로 분리하고, 로그인을 하던 하지 않던 cache가 되어 있도록 한다.

## 20, 21일차 - 게시글 목록

주제별(cluster 별) 게시글 보기 페이지 작성함.

구현하고자 했던 내용은

- graph에서 노드를 클릭하면 해당 주제로 게시글 목록이 스크롤됨
- 게시글 목록 상단에 주제들이 나와있음
- 게시글 목록에서 스크롤을 하면 스크롤된 주제에 맞게 graph와 상단바가 변화함.

`getClusterFeed` 액션 => cluster 게시글 정보는 매우 드물게 업데이트 된다. 따라서 별도의 view 테이블을 작성하지 않고, join의 join을 거듭하면서 객체 하나를 내놓도록 서버 액션을 작성하였다.

`cluster-post-list` 게시글을 스크롤하면 intersectionObserver를 통해 선택된 cluster가 무엇인지 바꾼다. 이때 'isManualScrolling'을 true로 하면서 바꾼다.

`cluster-section` 게시글 목록보다 상위에 있는 컴포넌트로, 선택된 cluster가 무엇인지에 따라 postList를 스크롤링 한다. 이때 isManualScrolling이 true이면 자동 스크롤링을 하지 않는다.

그 밖에

- SVG 배경에 button을 넣었더니 safari에서 작동하지 않는 문제가 있어서 button을 제거하고 순수 svg로 변경하였다.
- 게시글 목록 상단에 cluster 목록을 보여주는 header에 스크롤 상하를 스크롤 좌우로 바꿔주는 이벤트를 넣어두었다.

추가적으로 이번 디자인은 Frosted Glass 컨셉으로 잡아보았다.  
의외로 디자인이 괜찮은 것 같아서 이쪽 디자인으로 밀고가면 좋을듯.

## 22일차 - 사이드바 재 디자인

### 사이드바 재디자인

기존 사이드바를 폐기하고
`components/post/sidebar/post-sidebar-wrapper.tsx`
`components/post/sidebar/post-sidebar.tsx`
여기에 재설정.

게시글 목록 전체를 불러온 이후 필터를 걸도록 하여 성능 향상이 있었고,
왼쪽은 카테고리를 선택하고, 오른쪽은 게시글 목록을 선택하는 방식으로 나누었다.

모바일일때의 로직은 별도로 분리하였다.

추천게시글을 보여주는 부분이 사라졌는데 어디서 보여줄지 고민해봐야 할듯.

### 테일윈드 테마 설정

기초적인 색상 및 glassmorphism 구현에 필요한 테마들 설정

#### 🔧 `tailwind.config.ts`

```ts
export default {
  theme: {
    extend: {
      colors: {
        // 텍스트 & 배경 토큰
        "color-base": "var(--color-base)",
        "color-muted": "var(--color-muted)",
        "color-bg": "var(--color-bg)",
        "color-border": "var(--color-border)",
        "color-hover": "var(--color-hover)",
        "color-selected-bg": "var(--color-selected-bg)",
        "color-selected-text": "var(--color-selected-text)",

        // 기본 Glass
        "glass-bg": "var(--glass-bg)",
        "glass-border": "var(--glass-border)",

        // 색상별 Glass 배경 & 텍스트
        "glass-primary": "var(--glass-primary-bg)",
        "glass-success": "var(--glass-success-bg)",
        "glass-warning": "var(--glass-warning-bg)",
        "glass-danger": "var(--glass-danger-bg)",
        "glass-neutral": "var(--glass-neutral-bg)",

        "glass-text-primary": "var(--glass-primary-text)",
        "glass-text-success": "var(--glass-success-text)",
        "glass-text-warning": "var(--glass-warning-text)",
        "glass-text-danger": "var(--glass-danger-text)",
        "glass-text-neutral": "var(--glass-neutral-text)",
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
};
```

---

#### `globals.css`

```css
:root {
  --color-base: #374151;
  --color-muted: #9ca3af;
  --color-bg: #f9fafb;
  --color-border: #e5e7eb;
  --color-hover: #f3f4f6;
  --color-selected-bg: #e5e7eb;
  --color-selected-text: #111827;

  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  --glass-blur: blur(12px);

  --glass-primary-bg: rgba(59, 130, 246, 0.2);
  --glass-success-bg: rgba(34, 197, 94, 0.2);
  --glass-warning-bg: rgba(251, 191, 36, 0.25);
  --glass-danger-bg: rgba(239, 68, 68, 0.25);
  --glass-neutral-bg: rgba(107, 114, 128, 0.2);

  --glass-primary-text: #1e3a8a;
  --glass-success-text: #14532d;
  --glass-warning-text: #78350f;
  --glass-danger-text: #7f1d1d;
  --glass-neutral-text: #1f2937;
}

.dark {
  --color-base: #d1d5db;
  --color-muted: #6b7280;
  --color-bg: #030712;
  --color-border: #374151;
  --color-hover: #1f2937;
  --color-selected-bg: #374151;
  --color-selected-text: #ffffff;

  --glass-bg: rgba(17, 24, 39, 0.4);
  --glass-border: rgba(255, 255, 255, 0.1);

  --glass-primary-bg: rgba(59, 130, 246, 0.1);
  --glass-success-bg: rgba(34, 197, 94, 0.1);
  --glass-warning-bg: rgba(251, 191, 36, 0.15);
  --glass-danger-bg: rgba(239, 68, 68, 0.15);
  --glass-neutral-bg: rgba(107, 114, 128, 0.1);

  --glass-primary-text: #93c5fd;
  --glass-success-text: #6ee7b7;
  --glass-warning-text: #fde68a;
  --glass-danger-text: #fca5a5;
  --glass-neutral-text: #d1d5db;
}
```

---

#### Tailwind 토큰 요약표

| 색상 이름 (`--color-*`) | Tailwind 클래스 예시       | 역할 설명          |
| ----------------------- | -------------------------- | ------------------ |
| `--color-base`          | `text-color-base`          | 본문 텍스트        |
| `--color-muted`         | `text-color-muted`         | 설명 텍스트        |
| `--color-bg`            | `bg-color-bg`              | 배경 색상          |
| `--color-border`        | `border-color-border`      | 테두리 색상        |
| `--color-hover`         | `hover:bg-color-hover`     | hover 상태         |
| `--color-selected-bg`   | `bg-color-selected-bg`     | 선택된 항목 배경   |
| `--color-selected-text` | `text-color-selected-text` | 선택된 항목 텍스트 |

| Glass 토큰             | 클래스 예시               | 설명                             |
| ---------------------- | ------------------------- | -------------------------------- |
| `--glass-bg`           | `bg-glass-bg`             | 기본 글라스 배경                 |
| `--glass-border`       | `border-glass-border`     | 글라스 경계선                    |
| `--glass-shadow`       | `shadow-glass`            | 글라스 전용 그림자               |
| `--glass-blur`         | `backdrop-blur-glass`     | blur 효과                        |
| `--glass-primary-bg`   | `bg-glass-primary`        | 파란색 계열 Glass 배경           |
| `--glass-primary-text` | `text-glass-text-primary` | 파란색 계열 Glass 텍스트 색상    |
| `--glass-success-bg`   | `bg-glass-success`        | 초록색 계열 Glass 배경           |
| `--glass-success-text` | `text-glass-text-success` | 초록색 계열 Glass 텍스트 색상    |
| `--glass-warning-bg`   | `bg-glass-warning`        | 주황색 계열 Glass 배경           |
| `--glass-warning-text` | `text-glass-text-warning` | 주황색 계열 Glass 텍스트 색상    |
| `--glass-danger-bg`    | `bg-glass-danger`         | 빨간색 계열 Glass 배경           |
| `--glass-danger-text`  | `text-glass-text-danger`  | 빨간색 계열 Glass 텍스트 색상    |
| `--glass-neutral-bg`   | `bg-glass-neutral`        | 중성 회색 계열 Glass 배경        |
| `--glass-neutral-text` | `text-glass-text-neutral` | 중성 회색 계열 Glass 텍스트 색상 |

## 23일차 메인화면 디자인

### 메인화면

메인화면을 글라스모피즘으로 디자인했다.
글라스모피즘이 두드러질 수 있도록 배경화면에는 움직이는 CSS 배경을 적용하고,
투명하고 blur효과가 강한 박스들을 화면에 배치하였다.

반투명 배경 + 블러 + rounded 효과까지 더해지니 너무 과한 것 같아서 rounded는 기본 테마에서 제외.

메인화면에서 보여줄 기능은
카테고리별 보기, 최신글 순, 지식지도 - 세가지로 하고, 나머지 3가지 페이지를 다시 한 번 리팩토링하며 구현하도록 한다.

### 지도 페이지

군집 그래프를 보는 페이지이다.
전체적으로 디자인만 살짝 가다듬었고,
기능적으로는 군집그래프의 버튼들을 rect와 text로 변경하였다. 버튼을 넣으면 safari에서 작동이 되지 않는다.

그 밖에 색상들을 글래스모피즘과 어울리는 색상들로 변경하였다.

또한 scrollIntoView를 하니 홈 화면 전체가 이동하는 문제가 있어 scrollTo로 변경하였다.

- 지도 페이지 할 일
  - 우측 게시글 목록 열고 기능
  - 캐싱 전략 다시 검토

## 24일차 : 검색 원격 프로시져, cache wrapper함수 버전2

### 메인페이지 지도

isMain이라는 플래그를 만들어서 메인화면에서는 120개의 글 전체를 렌더링하지 않도록 수정하였다.

### 검색 쿼리 (supabase full text search)

#### tsv 벡터 생성

postgreSQL의 full text search를 이용하여 검색기능을 구현하도록 한다.

```sql
-- Supabase SQL Editor에서 실행
alter table posts add column if not exists tsv tsvector;

-- 기존 데이터의 tsv 초기화
update posts set tsv =
  setweight(to_tsvector(coalesce(title, '')), 'A') ||
  setweight(to_tsvector(coalesce(body, '')), 'B');

-- tsvector 자동 업데이트 트리거 생성
create function posts_tsv_trigger() returns trigger as $$
begin
  new.tsv :=
    setweight(to_tsvector(coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector(coalesce(new.body, '')), 'B');
  return new;
end
$$ language plpgsql;

create trigger tsv_update before insert or update
on posts for each row execute procedure posts_tsv_trigger();
```

위의 명령어를 실행하면 tsv 벡터가 생성된다.

#### view 테이블 생성

앞서 cluster 기능 만들면서 널부러뜨려놨던 postCart 타입을 별도의 view 테이블로 분리한다.

```sql
CREATE OR REPLACE VIEW posts_with_tags_summaries AS
SELECT
  p.id,
  p.title,
  COALESCE(p.short_description, ais.summary) AS short_description,
  p.thumbnail,
  p.released_at,
  p.url_slug,
  -- 명확히 JSON 배열로 변환해서 반환
  COALESCE(
    ARRAY_AGG(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name
      )
    ) FILTER (WHERE t.id IS NOT NULL), ARRAY[]::jsonb[]
  ) AS tags,
  p.tsv,
  p.body,
  p.is_private
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
LEFT JOIN ai_summaries ais ON ais.post_id = p.id
GROUP BY p.id, ais.summary;
```

#### RPC를 통한 검색 수행

```sql
CREATE OR REPLACE FUNCTION search_posts_with_snippet(
  search_text text,
  page int,
  page_size int
)
RETURNS TABLE (
  id uuid,
  title text,
  short_description text,
  thumbnail text,
  released_at timestamptz, --  여기 timestamptz로 변경!
  url_slug text,
  tags jsonb[], -- 여기 json → jsonb[]로 명확히 수정!
  snippet text
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.short_description,
    v.thumbnail,
    v.released_at,
    v.url_slug,
    v.tags, -- 이미 배열 형태로 정의됨
    -- 검색어 없으면 snippet을 null로, 있으면 실제 snippet을 생성!
    CASE
      WHEN search_text = '' THEN NULL
      ELSE ts_headline(
        v.body,
        plainto_tsquery(search_text),
        'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,FragmentDelimiter=...,MaxWords=20,MinWords=5'
      )
    END AS snippet
  FROM posts_with_tags_summaries v
  WHERE (v.is_private IS NULL OR v.is_private IS FALSE)
    AND (search_text = '' OR v.tsv @@ plainto_tsquery(search_text))
  ORDER BY v.released_at DESC
  OFFSET (page * page_size)
  LIMIT page_size;
END;
$$;
```

#### server action과 캐싱

```tsx
export const _getPosts = async ({
  page,
  limit = 10,
  search = "",
}: GetPostsParams) => {
  const supabase = await createClient();

  const { data: posts, error } = await supabase.rpc(
    "search_posts_with_snippet",
    {
      search_text: search,
      page,
      page_size: limit,
    }
  );

  if (error || !posts) {
    console.error(error);
    throw new Error("데이터를 불러오는데 실패했습니다.");
  }

  return posts.map((post) => ({
    ...post,
    tags: post.tags as unknown as PostTags[], // Json[]의 타입을 명확히 지정
  }));
};
```

이제 이렇게만 작성하면 아래와 같은 타입으로 튀어나온다

```tsx
const getPosts: ({ page, limit, search }: GetPostsParams) => Promise<
  {
    tags: PostTags[];
    id: string;
    title: string;
    short_description: string;
    thumbnail: string;
    released_at: string;
    url_slug: string;
    snippet: string;
  }[]
>;
```

`    snippet: string;`는 supabase cli에서 nullable인지 파악을 못한다.

캐시키에 사용할 수 있도록 캐시키 팩토리에 by page를 추가해주고

```tsx
export const CACHE_TAGS = {
  POST: {
    ALL: () => "posts",
    BY_PAGE: (page: number) => "posts:by_page:" + page.toLocaleString(),
  },
} as const;
```

캐싱을 하는 함수는 아래와 같이 작성한다.

```tsx
export const getPosts = ({ page, limit, search }: GetPostsParams) =>
  unstable_cache(
    () => _getPosts({ page, limit, search }),
    [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(page)],
    { revalidate: 60 * 60 * 24 * 7, tags: [CACHE_TAGS.POST.ALL()] }
  )();
```

여기서 search가 있는 경우에는 아에 캐싱이 되지 않도록 분기를 넣어준다.

```tsx
export const getPosts = async (params: GetPostsParams) => {
  const { search, page } = params;

  if (search) return _getPosts(params);

  const cached = unstable_cache(
    () => _getPosts(params),
    [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(page)],
    {
      revalidate: 60 * 60 * 24 * 7,
      tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(page)],
    }
  );

  return cached();
};
```

여기에 추가적으로,
supabase 클라이언트를 요청단에서 호출해서 server action으로 넘겨주는 패턴도 이 녀석에 실험적으로 적용시켜 본다.

이런 패턴을 사용할 때에는 필수요소인 supabase 클라이언트를 첫번째 인자로 넘겨야 한다.

```tsx
"use server";

import { PostTags } from "@/types/graph";
import { Database } from "@/types/supabase";
import { CACHE_TAGS } from "@/utils/nextCache";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

interface GetPostsParams {
  page: number;
  limit?: number;
  search?: string;
}

export const _getPosts = async (
  supabase: SupabaseClient<Database>,
  { page, limit = 10, search = "" }: GetPostsParams
) => {
  const { data: posts, error } = await supabase.rpc(
    "search_posts_with_snippet",
    {
      search_text: search,
      page,
      page_size: limit,
    }
  );

  if (error || !posts) {
    console.error(error);
    throw new Error("데이터를 불러오는데 실패했습니다.");
  }

  return posts.map((post) => ({
    ...post,
    tags: post.tags as unknown as PostTags[], // Json[]의 타입을 명확히 지정
  }));
};

export const getPosts = async (params: GetPostsParams) => {
  const supabase = await createClient();
  const { search, page } = params;

  if (search) return _getPosts(supabase, params);

  const cached = unstable_cache(
    () => _getPosts(supabase, params),
    [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(page)],
    {
      revalidate: 60,
      tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(page)],
    }
  );

  return cached();
};
```

#### 캐시 래퍼함수 new 버전

검색 기능을 구현하다가 캐시 래퍼함수의 추상화 방안이 생각나서 실행.

```tsx
export const withSupabaseCache = async <P, T, Single extends boolean = false>(
  params: P,
  options: WithCacheParams<P, T, Single>
): Promise<WithSupabaseReturn<T, Single>> => {
  const supabase = await createClient(await cookies());

  if (options.skipCache?.(params)) {
    return options.handler(supabase, params);
  }

  const cached = unstable_cache(
    () => options.handler(supabase, params),
    options.key,
    {
      revalidate: options.revalidate ?? 60,
      tags: options.tags,
    }
  );

  return cached();
};
```

params는 서버 액션을 실행할 때 넘겨주는 params이고,
option는 서버 액션을 작성할 때에 기재하는 options이다.

완성된 패턴은 아래와 같다.

```tsx
interface GetPostsParams {
  page: number;
  limit?: number;
  search?: string;
}

export const _getPosts = async (
  supabase: SupabaseClient<Database>,
  { page, limit = 10, search = "" }: GetPostsParams
): Promise<PostgrestResponse<CardPost>> => {
  const result = await supabase.rpc("search_posts_with_snippet", {
    search_text: search,
    page,
    page_size: limit,
  });

  return result;
};

export const getPosts = (params: GetPostsParams) =>
  withSupabaseCache<GetPostsParams, CardPost>(params, {
    handler: _getPosts,
    key: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(params.page)],
    tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(params.page)],
    skipCache: ({ search }) => !!search, // 검색어 있으면 캐싱하지 않음
    revalidate: 60 * 60 * 24 * 7, // 1주일 캐싱
  });
```

withSupabaseCache에서 options를 통해서 캐싱을 하는 조건(skipCache)과 태그 등을 입력하게 된다.

이렇게 getPosts로 불러오는 경우 검색어가 있으면 snippet이 붙는데, innerHTML로 넘겨주면 된다.

```tsx
{
  post.snippet ? (
    <p
      className={cn(
        "whitespace-pre-line",
        isFeatured ? "text-base line-clamp-6" : "text-sm line-clamp-2"
      )}
      dangerouslySetInnerHTML={{ __html: post.snippet }}
    />
  ) : (
    <p
      className={cn(
        "whitespace-pre-line",
        isFeatured ? "text-base line-clamp-6" : "text-sm line-clamp-2"
      )}
    >
      {post.short_description
        ?.replaceAll("&#x3A;", ":")
        .replaceAll("https", "\nhttps")}
    </p>
  );
}
```

snippet에는 검색결과가 일치하는 부분이 `<mark>` 태그로 감싸져 있다.

globals.css에 mark태그의 스타일을 넣어주었다.

````css
/* 검색 시 강조 */
mark {
  background-color: rgba(254, 240, 138, 0.5); /* yellow-100 + 50% 투명도 */
  color: inherit;
  padding: 0rem 0.15rem;
  border-radius: 0.25rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  mark {
    background-color: rgba(253, 224, 71, 0.25); /* amber-400/25 */
    color: inherit;
  }
}```
````

## 24일차 + 25일차 : 시리즈 보기 화면

시리즈는 복잡하게 생각할 것 없이 UX, UI 적인 측면으로 풀어내면 된다고 생각한다.

이렇게 섹션별로 시리즈를 디스플레이 하다가

```
----
추천 시리즈
| 시리즈 1| 시리즈 3| 시리즈 5|
----
CS 공부
| 시리즈 1| 시리즈 2| 시리즈 3|
----
리액트
| 시리즈 7| 시리즈 8| 시리즈 10|
----
```

시리즈를 하나 클릭했을 때 설명이 섹션 하단부에 나오고

```
----
추천 시리즈
| 시리즈 1| 시리즈 3| 시리즈 5|
--
시리즈 3 소개
시리즈 3은 개쩌는 CS 공부입니다.
[더 보기]
----
CS 공부
| 시리즈 1| 시리즈 2| 시리즈 3|
----
리액트
| 시리즈 7| 시리즈 8| 시리즈 10|
----
```

더 보기를 누르면 게시글 목록을 보여주어야 하는데
shadcn의 drawer를 이용하면 간단하게 해결될 문제로 보인다.

```
--drawer--
시리즈 2
시리즈 2은 최고의 CS 공부입니다.

- 게시글 1
- 게시글 2
- 게시글 3
- 게시글 4
-----
```

#### 카테고리 view

카테고리의 최신 게시글 날짜 및 총 게시글 수를 함께 볼 수 있는 view를 만들고자 한다.

먼저 기존에 post카드 용으로 만들었던 posts_with_tags_summaries 테이블에 subcategory_id를 추가해준다.

또한 비공개된 게시글은 view 테이블에 잡히지 않도록 명확하게 만들어 준다.

```sql
CREATE OR REPLACE VIEW posts_with_tags_summaries AS
SELECT
  p.id,
  p.title,
  COALESCE(p.short_description, ais.summary) AS short_description,
  p.thumbnail,
  p.released_at,
  p.url_slug,
  -- 명확히 JSON 배열로 변환해서 반환
  COALESCE(
    ARRAY_AGG(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name
      )
    ) FILTER (WHERE t.id IS NOT NULL), ARRAY[]::jsonb[]
  ) AS tags,
  p.tsv,
  p.body,
  p.is_private,
  p.subcategory_id, -- 여기 추가
  p."order" -- 여기도 추가
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
LEFT JOIN ai_summaries ais ON ais.post_id = p.id
where (p.deleted_at is null)
  and (p.is_private is null or p.is_private = false) -- 공개된 게시글만 보도록
GROUP BY p.id, ais.summary, p.subcategory_id; -- 여기도 추가
```

이제 이 테이블과 연동하여 subcategory에 포함된 게시글 갯수를 노출시키는 view를 만든다.

```sql
create or replace view subcategories_with_meta as
select
  s.category_id,
  s.created_at,
  s.description,
  s.id,
  s.name,
  s.url_slug,
  s."order",
  s.recommended,
  s.thumbnail,
  count(p.id) as post_count,
  max(p.released_at) as latest_post_date
from subcategories s
left join posts_with_tags_summaries p on p.subcategory_id = s.id
where s.deleted_at is null
group by
  s.category_id,
  s.created_at,
  s.description,
  s.id,
  s.name,
  s."order",
  s.recommended,
  s.thumbnail;
```

#### 카테고리 조회 server action

components/series/actions.ts 에 새로 작성한 server action은 아래와 같다.

```tsx
export const _getSeriesList = async (
  supabase: SupabaseClient<Database>,
  { categoryId, recommended = false }: GetSeriesListParams
): Promise<PostgrestResponse<Series>> => {
  const query = supabase
    .from("subcategories_with_meta")
    .select("*")
    .not("latest_post_date", "is", null)
    .order("latest_post_date", { ascending: false }); // 전체 조회시 최신이 가장 위로

  if (categoryId) {
    query.eq("category_id", categoryId).order("order", { ascending: true });
  }

  if (recommended) {
    query.is("recommended", recommended).order("order", { ascending: true });
  }

  const result = await query;

  return result;
};

export const getSeriesList = async (params?: GetSeriesListParams) => {
  const tags = ["subcategories_with_meta", CACHE_TAGS.SUBCATEGORY.ALL()];
  if (params?.categoryId) {
    tags.push(CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(params.categoryId));
  }
  if (params?.recommended) {
    tags.push(CACHE_TAGS.SUBCATEGORY.BY_RECOMMENDED());
  }

  return withSupabaseCache<GetSeriesListParams, Series>(params || {}, {
    handler: _getSeriesList,
    key: [...tags],
    tags: [...tags],
    revalidate: 60 * 60 * 24 * 30, // 30일 캐싱
  });
};
```

params에 categoryId가 있으면 categoryId를 기준으로 불러오고, 이를 cache tags에 추가한다.

마찬가지로 recommended가 있으면 이를 기준으로 불러오고 cache tags에 추가한다.

둘 다 없는 경우에는 전체 서브카테고리를 가장 최신에 업데이트된 순으로 불러온다.

사실 categoryId와 recommended는 상호 배타적이라 따로 분리하는 것이 좋지만.

#### 페이지 구현

`/series` 페이지 : 캐러셀의 버튼을 누르면 series가 선택된다. 선택된 series에 관한 정보가 drawer로 하단에서부터 노출된다.
`/series/[url_sulg]` 페이지 : series의 게시글 목록이다.

처음에는 하단의 drawer에서 게시글 목록을 모두 다 띄우려고 했는데, drawer에 게시글이 10개 20개씩 노출되는게 ui/ux 적으로 부적절하기도 하고, 게시글을 봤다가 게시글 목록을 보는 유저들의 사용 패턴과도 맞지 않는다고 생각하였다. 이에 따라 series/url_slug 페이지를 분리하였고, url_slug 페이지는 static하기 때문에 오히려 서버의 요청 수가 줄어드는 부수적인 장점이 있다.

한편 series/url_slug를 분리하였으니 서랍이 필요가 없지 않나 생각하였으나, '탐색'을 한다는 사용자 경험을 위해서 series 페이지에는 그대로 drawer를 유지하였다. 특히 series 카드를 클릭했는데 다짜고짜 페이지 이동이 일어나기 보다는 drawer를 통해서 내용을 한 번 더 확인하고 이동하는 것이 바람직해 보였다.

url_slug를 쓰는 페이지는 post/url_slug 페이지 밖에 없을 줄 알았는데....아무튼 그렇게 됐다.

### cluster 부분 리팩토링

기존에 하드코딩으로 작성하였던 join을 posts_with_tags_summaries view와 조인하는 view로 리팩토링 하였다.

```sql
CREATE VIEW clustered_posts_groups_with_posts AS
SELECT
  g.id,
  g.title,
  g.post_ids,
  g.quality,
  g.summary,
  g.created_at,
  g.updated_at,
  g.vector,
  g.keywords,
    count(p.*) AS post_count,
  json_agg(
    json_build_object(
      'id', p.id,
      'title', p.title,
      'short_description', p.short_description,
      'thumbnail', p.thumbnail,
      'released_at', p.released_at,
      'url_slug', p.url_slug,
      'tags', p.tags
    )
  ) AS posts
FROM clustered_posts_groups g
JOIN LATERAL (
  SELECT
    p.id,
    p.title,
    p.short_description,
    p.thumbnail,
    p.released_at,
    p.url_slug,
    p.tags
  FROM posts_with_tags_summaries p
  WHERE p.id = ANY (g.post_ids)
) p ON true
GROUP BY
  g.id, g.title, g.post_ids, g.quality, g.summary, g.created_at, g.updated_at, g.vector, g.keywords;
```

## 26일차 + 27일차 Milkdown RAW 렌더링 모드

### 페이지 및 API 정리

[서버 액션 분류](./서버액션분류.md) 마크다운 파일 내부에 페이지별로 사용된 서버액션 및 API들을 정리하여 기재하였다.

### Milkdown 에디터 사용성 개선

초기 컨셉이 마크다운 에디터로 게시글을 보면서 동시에 수정하는 거였는데,

1. 마크다운을 편집할 일보다 마크다운을 조회하는 일이 많은데 불필요하게 마크다운 편집기능을 기본으로 둘 필요성이 적다
2. milkdown이 생각보다 무거워서 초기 로딩이 시간이 걸리고, 무엇보다 SSG의 이점을 다 죽여버린다.

그래서 기본적으로 읽기모드로 렌더링되도록 수정하였고,

zustand에서 '수정모드'가 되면 milkdown을 렌더링한다.

### RAW 렌더링 모드

Milkdown 공식 홈페이지에서 '플레이 그라운드' 라면서 wyswyg과 RAW를 동시에 보여주는 모습에 꽂혔다.

코드미러 기반으로 RAW 편집기를 구성하였다.

### RAW 편집기, MD 편집기 상태 관리

RAW 편집기와 MD 편집기를 같이 쓰면서 이슈가

1. MD 편집기에 상태를 주입시키는 법.. 다행히 milkdown utils에 replaceAll를 통해 주입하는 것을 알아냈다. editor.action(replaceAll(markdown));

2. RAW 편집기와 MD 편집기 상태 충돌 : 결국 예상했던 대로 RAW가 MD의 업데이트 이벤트를 발동시키고, MD가 RAW를 업데이트 하는 이벤트를 발동시키고...
   isFocused라는 상태를 둬서 isFocused인 경우에만 메인의 상태를 업데이트 시킬 수 있도록 하였다. 즉 body는 focus된 녀석에서 업데이트하는 상태이다.
   이렇게 하니까 한 두 프레임가량 상태를 주입받는 객체가 늦게 반응하긴 하는데 오히려 생각했던 것보다 반응이 빠릿빠릿해서 만족. 바로 한틱 다음에 따라오는 기분이다.

### 디자인

결과적으로, 편집모드에 진입하기 전 preview, MD 편집모드, RAW 편집모드, 여기에 더해 MD와 RAW를 같이 보여주는 모드까지 총 4개의 화면이 필요해졌다.

1. 우측 상단에 MD, RAW, COL-2 아이콘을 놓고, 각각을 토글하게 만들었다. 조건부로 토글되는 것보다 각각이 토글되는게 직관적이다.
2. 레이아웃과 관련된 로직은 토글 버튼인 `components/markdown/milkdown-app/toggle-edit-button.tsx`로 모두 모아놨다. 특히 COL-2 모드일 때에는 화면 레이아웃을 스냅샷 해놨다가, COL-2가 풀리면 사이드바가 되돌아온다.
3. `components/markdown/markdown-editor.tsx` 에서는 편집모드를 켰다 껏다 할 때에 레이아웃 쉬프트와 함께 스크롤이 초기화 되는 문제가 있었다. 그래서 편집모드가 켜지면 preview 위에다가 편집기를 뒤집어 씌우는 방식으로 최적화했다.
4. col-2 모드일 때에는 사이드바가 접히면서 화면 최대치를 차지하도록 했는데, absolute일 때에는 화면이 안커졌다. fixed로 화면을 차지하게 하여 해결했다.

Codemirror에 테마를 흑백으로 밀어넣고, 화면 레이아웃을 fixed랑 absolute로 맞추는 등... 별의 별짓거리를 다했는데, 완성해놓고보니 오히려 편집기능이 매우 강화되어 좋았다. preview 페이지로 서버사이드 렌더링 하려고 시작한 작업이 창대하게 끝났다.

## 28일차

### 디자인 개선

- glass-bg에 투명도 20, 40, 80을 추가하여 패널별로 가시성 개선
- 각 페이지별로 투명한 glassbox에 담기도록 수정
- 좌측 사이드바에 PC버전은 검색인풋, 모바일은 네비 추가

### markdown preview 개선

- img태그를 Next/Image 태그로 교체
- 코드 블럭에 break-word 저굥ㅇ하여 줄바꿈 적용

### image 재업로드

게시글을 확인하던 중 일부 이미지가 크롤링되지 않은 것을 확인
-> 크롤링 코드에서 png만 업로드하던 것을 수정하여 다른 이미지도 재업로드.

### 우측 사이드바에 추천 게시글 노출

getRecommendedPosts 기능을 어디에 넣을까 고민하다가, 인공지능 요약을 보여주는 우측 사이드바에 넣기로 하였다.  
상단에 패널 모드 선택을 만들고, 패널이 '추천 게시글'일 때 추천 게시글 목록을 보여주도록 수정하였다.
이 과정에서 post_similarities_with_target_info의 정보를 임시로 Posts 타입으로 바꿔주는 유틸 함수를 만들어 적용하였다.

## 28+29일차 사이드바 sortable 적용

### 사이드바 버그 수정

사이드바의 게시글 목록이 SSR이 안되는 이슈 : posts에서 url_slug를 찾도록 하는데, decodeuri가 안되어서 선택된 post를 찾지 못하는 이슈가 있었다. decode하도록 수정
사이드바 게시글 목록 상단 Subcategory 명이 하이드레이션 되는 이슈 : 기존에는 useEffect를 통해서 선택된 카테고리명을 찾도록 구성하였는데, selectedSubcategoryName이라는 상태를 zustand에 넣어서 관리하도록 전체적인 로직을 수정했다.

### Sidebar sortable 추가

#### 구현 목표

- 서브카테고리 목록을 드래그로 정렬 가능하게 만들고, 순서(order)를 저장할 수 있게 함.
- 모드가 on, off 되도록 하고, 정렬모드 off 일 때에는 Static 컴포넌트 보이도록.

#### 구현 요약

##### 1. `SortableItemWrapper`, `SortableListContainer` 구현

- `@dnd-kit/core`와 `@dnd-kit/sortable`을 기반으로 정렬 기능 추가
- 정렬된 항목의 순서를 계산하고, 변경된 항목만 `useOrderUpdateQueue`로 전달해 배치 저장

###### 함수형 Children

`SortableListContainer`의 `SortableContext`에 `{children(localItems)}`라는 패턴이 쓰이는데 이를 '함수형 children'이라 한다.  
`(sortedItems) => sortedItems.map((item) => ( ... ))` 이와 같은 함수형 children을 넘겨줄 때 사용한다.

즉, `(sortedItems) => sortedItems.map((item) => ( ... ))` 를 `SortableListContainer`에 children으로 넘겨주면,
`SortableListContainer`는 이를 `(localItems) => localItems.map((item) => ( ... ))`로 실행하여 렌더링한다.

##### 2. 정렬이 필요 없는 경우를 위한 Static 컴포넌트 구현

- `StaticItem`, `StaticContainer`는 정렬이 불필요한 상황에서 그대로 children만 렌더링하는 역할

---

##### 3. `Wrapper 컴포넌트 분기 처리`

Sortable List랑 Sortable Item을 wrapper 형태로 만들고,  
isSortable이 false일 때에는 비어있는 Pass-through 컴포넌트로 랩핑한다.

```ts
const ListContainer = isSortable ? SortableListContainer : StaticContainer;
const ItemWrapper = isSortable ? SortableItemWrapper : StaticItem;
```

#### 이러한 Pass-through 컴포넌트 랩핑을 통해 SortableListContainer, SortableItemWrapper의 다이나믹 임포트가 가능해짐.

##### 4. 성능 최적화: `dynamic import` 적용

- `SortableItemWrapper`, `SortableListContainer`는 `next/dynamic`으로 불러오고 SSR은 비활성화
- 로딩 중에는 별도 fallback 없이 Static 버전 렌더링

##### 5. 추상화

SortableListContainer, SortableItemWrapper, StaticContainer, StaticItem를 WithSortableItem, WithSortableList라는 컴포넌트로 합치고 마무리.

게시글과 카테고리에도 sortable이 가능하도록 적용한 뒤 디자인을 살짝 변형하여 끝냈다.

## 29일차

### 캐시 함수 + 인증 적용

1. PostgrestError 타입에 맞게 에러 객체를 반환하는 걸 몰라서 그간 헤맸다가, 에러 객체 까보니까 constructor로 만들어져 있더라. 그래서 감 잡고 수정함.
2. requireAuth라는 플래그를 세워서 조건들을 수정하였고, revalidate는 내가 원하는 바에 맞게, requreAuth가 있으면 기본값 0, 없으면 기본값 30일, 추가적으로 명시적인 revalidate 기간이 있으면 해당 기간을 따라가도록.
3. 이때 '널 병합 연산자' 라는 녀석이 요긴하게 쓰였다. revalidate가 0인 경우를 명시적으로 처리할 수 있게 된다. or 연산자(||)만 주로 썼는데, 많이 애용해야겠다.

```ts
// 새로운 캐시함수 래퍼
export type WithCacheParams<P, T, Single extends boolean = false> = {
  key?: string[];
  tags?: string[];
  revalidate?: number;
  single?: Single;
  requireAuth?: boolean;
  skipCache?: (params: P) => boolean;
  handler: (
    supabase: SupabaseClient,
    params: P
  ) => Promise<WithSupabaseReturn<T, Single>>;
};

// 응답 타입 분기 유틸
type WithSupabaseReturn<T, Single extends boolean> = Single extends true
  ? PostgrestSingleResponse<T>
  : PostgrestResponse<T>;

const makeAuthError = <T, Single extends boolean>(): WithSupabaseReturn<
  T,
  Single
> => {
  const error = new Error("Authentication required") as PostgrestError;
  error.code = "401";

  return {
    data: null,
    error,
    count: null,
    status: 401,
    statusText: "Unauthorized",
  } as WithSupabaseReturn<T, Single>;
};
/**
 * Supabase Client를 기반으로 캐싱된 서버 요청을 실행합니다.
 *
 * - 캐시 키 및 태그를 통해 `unstable_cache`를 구성합니다.
 * - `single` 옵션을 통해 단건(single) 또는 다건(list) 응답을 선택할 수 있습니다.
 * - `skipCache` 조건이 true일 경우 캐시를 우회하고 항상 fresh 요청을 실행합니다.
 *
 * @template P - 파라미터 타입
 * @template T - 반환될 데이터의 row 타입
 * @template Single - 단건 여부 (`true`이면 PostgrestSingleResponse, 아니면 PostgrestResponse)
 *
 * @param params - Supabase 요청에 전달할 파라미터
 * @param options - 캐싱과 핸들러 설정
 * @param options.handler - Supabase 요청을 수행할 비동기 핸들러
 * @param options.key - unstable_cache에 사용할 고유한 캐시 키
 * @param options.tags - 캐시 무효화에 사용할 태그 목록
 * @param options.requireAuth - true인 경우 인증된 사용자만 요청 가능 (기본: false)
 * @param options.revalidate - 캐시 재검증 주기 (초 단위, 기본값: 미인증시 30일 / 인증필요시 fresh)
 * @param options.skipCache - 조건부 캐시 우회 함수 (true일 경우 handler를 직접 호출)
 * @param options.single - 단건 조회 여부 (true 시 PostgrestSingleResponse<T> 반환)
 *
 * @returns Supabase 응답 객체 (단건 또는 다건 응답)
 */
export const withSupabaseCache = async <P, T, Single extends boolean = false>(
  params: P,
  options: WithCacheParams<P, T, Single>
): Promise<WithSupabaseReturn<T, Single>> => {
  const supabase = await createClient(await cookies());
  const { handler, key, tags, requireAuth = false, skipCache } = options;

  // 인증 필요할 경우 무조건 fresh 요청
  if (requireAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // tip: 인증된 사용자만 session이 생성됨
    if (!session?.user) {
      return makeAuthError<T, Single>();
    }
  }

  // 캐시 우회 조건: skipCache거나, revalidate === 0일 때
  const shouldSkipCache = skipCache?.(params) || options.revalidate === 0;

  if (shouldSkipCache) {
    return handler(supabase, params);
  }

  // 널 병합 연산자 : revalidate가 null 또는 undefined일 때만 → 30일
  const revalidate = options.revalidate ?? 60 * 60 * 24 * 30;

  const cached = unstable_cache(() => handler(supabase, params), key ?? [], {
    revalidate,
    tags,
  });

  return cached();
};

// 캐시 함수 예시

// 1. 다건 조회 / 30일 캐싱
// await withSupabaseCache({}, {
//   key: ["posts", "all"],
//   tags: ["posts"],
//   handler: async (supabase) => {
//     return supabase.from("posts").select("*");
//   },
// });

// 2. 단건 조회 / 5분 캐싱
// await withSupabaseCache({ id: 123 }, {
//   key: ["post", "by-id", "123"],
//   tags: ["post:123"],
//   revalidate: 60 * 5,
//   single: true,
//   handler: async (supabase, { id }) => {
//     return supabase.from("posts").select("*").eq("id", id).single();
//   },
// });

// 3. 인증 필요 / 노 캐싱
// await withSupabaseCache({ user_id: "abc" }, {
//   requireAuth: true,
//   single: false,
//   handler: async (supabase, { user_id }) => {
//     return supabase.from("followers").select("*").eq("user_id", user_id);
//   },
// });

// 4. 인증 필요 / 5분 캐싱
// await withSupabaseCache({ user_id: "abc" }, {
//   requireAuth: true,
//   single: false,
//   revalidate: 60 * 5,
//   handler: async (supabase, { user_id }) => {
//     return supabase.from("followers").select("*").eq("user_id", user_id);
//   },
// });

// 5. 다건 조회 / 검색어가 있는 경우 노 캐싱
// await withSupabaseCache({ keyword: "hello" }, {
//   key: ["posts", "search"],
//   tags: ["posts"],
//   skipCache: ({ keyword }) => !!keyword,
//   handler: async (supabase, { keyword }) => {
//     return supabase.from("posts").select("*").ilike("title", `%${keyword}%`);
//   },
// });
```

### 수정 기능 팝 오버

1. 기존 MoreVertical 버튼을 각각 아이템들의 우측으로 위치를 옮겼다.
2. 이후 MoreVertical 버튼을 popover trigger로 하는 popover shadcn ui로 수정하였다.

### DND 오류 수정

1. POPOVER가 된 상태에서 수정을 할 때에 POPOVER에 대한 클릭이 드래그로 인식되는 문제가 있었다. -> with-sortable-item 컴포넌트가 이름 부분만 감싸도록 수정하였다. 드래그 시에 MoreVertical을 안 움직이고 이름 부분만 움직이긴 하는데, 이거 더 자연스러워서 냅뒀다. (MoreVertical도 같이 움직이게 하려면 특정 요소에만 draggable 이벤트를 주고... 아무튼 많이 복잡하기도 하다.)
2. 드래그가 끝날 때에 이를 클릭 이벤트로 인지해서 링크가 이동하거나 접혀져있던 카테고리가 펴지는 문제가 있었다. -> dragStart 이벤트에 flag를 on하고, dragEnd 이벤트에 플래그를 off 한다. flag가 on일 때에는 on-click이벤트가 none이도록 스타일을 입혔다.

### sonner 적용

react-hot-toast를 쓰던 중에 warning 토스트가 없는게 불만이었다.
그래서 깔끔하게 toast들을 shadcn sonner로 전부 교체하고 react-hot-toast는 지웠다.

### 남은 할 일

1. 수정 기능을 팝오버로 구현하기
2. 게시글 조회기능에서 인증 여부에 따라서 is_private를 RLS로 적용하기
3. 기존에 조회 기능들을 actions 파일에 넣었던 것들을 fetchers 파일로 옮기기
4. fetchers 파일로 옮긴 것들을 withSupabaseCache 랩퍼로 감싸도록 리팩토링 하기
5. 리팩토링 후 비공개된 게시글이 캐싱이 되는지 안되는지 테스트 해보기
6. sonner 디자인 입히기

   일단 오늘은 여기까지.
   30일에 배포하려고 했는데....안 돼 안 돼...

## 30일차

### 스타일링

Milkdown의 Codemirror에 스타일링 적용하는 방법을 익혀서 uiw의 vocode 다크 테마를 적용했다.(oneDark 테마를 내가 하드코딩으로 적용한줄 알고 까보기 시작했는데 아니었고...)  
이후 highlight 테마와 vscode 테마가 색상이 달라서 uiw vscode 테마에 맞게 수정하였다.  
자바스크립트 기준으로 스타일링 수정함. 결과적으로 자바스크립트는 실제 vscode랑 가장 비슷해졌다.

그 밖에 이전에 수정하다가 미처 다 못한 issortable swtich 의 스타일링 수정하였다.

### Milkdown Playground - 파싱 구조 개선

Milkdown 공식 홈페이지의 코드를 찾았다. [github - Milkdown/website/Playground ](https://github.com/Milkdown/website/blob/main/src/components/playground)

Playground 코드보다 현재 내가 짠 코드가 더 빠릿빠릿 잘 동작해서 수정할 부분은 없었는데, ReplaceAll로 수정하던 부분을 Milkdown Playground에 맞게 다시 수정했다. 확실히 성능 개선은 있는 듯.

### 사이드바 - 게시글 업데이트 버튼 **Render Props 패턴**

게시글 업데이트를 누르면 상태를 확인 후 portal이 닫혀야 한다.

**Render Props 패턴**
`<PopoverContent />`에 `children`을 그냥 JSX로 넘기는 대신,  
**함수로 넘기면 내부에서 `onClose()`를 주입해줌**.

```tsx
<PopoverContent side="bottom" align="end">
  {(onClose) => <PostUpdateForm post={post} onClose={onClose} />}
</PopoverContent>
```

이렇게 하면 `PostUpdateForm` 내부에서 `onClose()`를 호출해 Popover를 닫을 수 있음.

Popover content에서는 chlidren을 react node가 아니라 함수 형태로 받는다.

```tsx
type UpdatePopoverProps = {
  children: (props: { onClose: () => void }) => ReactNode;
};
```

그리고 자식 노드는 아래와 같이 children을 실행하는 형태.

```tsx
<PopoverContent side="bottom" align="end" className="p-2 shadow-xl bg-color-bg">
  {children({ onClose: () => setOpen(false) })}
</PopoverContent>
```

이걸 이용해서 post update form 완성하고 마무리...

### 분류, 시리즈, 게시글 비공개 전략

분류, 시리즈는 포함된 시리즈 혹은 게시글이 없으면 비공개로 한다.
-> 포함된 게시글의 수를 count로 넣는 새로운 view 테이블 필요.

게시글은 isPrivate이면 좌물쇠 표시를 제목 앞에 넣는다.
-> 아이콘만 추가하면 됨.

### 새 분류

새 분류 버튼을 사이드바 좌측 상단 편집모드와 같은 라인에 두고,
새 분류 버튼을 클릭하면 pop over가 나타나도록 하였다.

게시글 업데이트 팝오버를 재사용 하면서 재사용성이 높도록 약간 수정을 가하였고,  
편집모드(isSortable)이 false일 때에는 import가 되지 않도록 popover, popover-app을 따로 분리하였다.

### isSortable 세션 스토리지 활용

게시글을 이동할 때마다 isSortable이 off 되는 것이 사용성에 좋지 않았다.  
serachParams를 이용하려고 했지만, 링크 태그 전체를 serachParams에 맞게 href props를 변경해주는 것이 사실상 바람직 하지 않았음.

그래서 세션 스토리지를 활용하기로 했다.

Zustand Persiste 미들웨어는 서버사이드 렌더링과 충돌이 많이 일어나고, 너무 헤비해서 isSortable만 세션 스토리지로 저장한다.

기존 toggleIsSortable

```tsx
      set((state) => { isSortable: !state.isSortable }),
```

세션 스토리지에 저장하도록 한 isSortable

```tsx
    toggleIsSortable: () =>
      set((state) => {
        const newValue = !state.isSortable;
        sessionStorage.setItem("isSortable", JSON.stringify(newValue));
        return { isSortable: newValue };
      }),
```

위 상태로도 잘 작동되지만, 서버사이드에서 오류가 날 수 있음으로 아래와 같이 런타임 가드를 씌워준다.

```tsx
    toggleIsSortable: () =>
      set((state) => {
        const newValue = !state.isSortable;
        if (typeof window !== "undefined") {
          sessionStorage.setItem("isSortable", JSON.stringify(newValue));
        }
        return { isSortable: newValue };
      }),
```

기존에 만들어두었던 sidebar hydrator에서 주입해준다.

```tsx
// 사이드바 상태를 주입
export default function SidebarHydrator() {
  const setIsSortable = useSidebarStore((state) => state.setIsSortable);

  useEffect(() => {
    const stored = sessionStorage.getItem("isSortable");
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      setIsSortable(parsed);
    }
  }, [setIsSortable]);

  return null;
}
```

### isEditMode 세션 스토리지 적용

```tsx
export const safeSessionSet = <T,>(key: string, value: T) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

export function hydrateFromSessionStorage<T>(
  key: string,
  setter: (value: T) => void
) {
  if (typeof window === "undefined") return;

  const stored = sessionStorage.getItem(key);
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      setter(parsed);
    } catch (e) {
      console.warn(`Failed to parse sessionStorage[${key}]`, e);
    }
  }
}
```

위와 같은 유틸 함수를 만들어서 isEditMode와 관련해서도 적용해주었다. sidebarHydrator는 PostPageHydrator로 변경하였다.

```tsx
// 세션 스토리지 상태를 주입
export default function PostPageHydrator() {
  const setIsSortable = useSidebarStore((state) => state.setIsSortable);
  const setIsEditMode = useAutosave((state) => state.setIsEditMode);
  const setIsMarkdown = useAutosave((state) => state.setIsMarkdown);
  const setIsRaw = useAutosave((state) => state.setIsRaw);

  useEffect(() => {
    hydrateFromSessionStorage("isSortable", setIsSortable);
    hydrateFromSessionStorage("isEditMode", setIsEditMode);
    hydrateFromSessionStorage("isMarkdownOn", setIsMarkdown);
    hydrateFromSessionStorage("isRawOn", setIsRaw);
  }, [setIsSortable, setIsEditMode, setIsMarkdown, setIsRaw]);

  return null;
}
```

### 31일차

### isSortable, isEditMode SSR 전환

어제 isSortable, isEditMode를 세션 스토리지에 저장하고 불러오는 방식을 사용하였는데,
이렇게 하는 경우 하이드레이션이 일어나며 화면이 깜빡깜빡 거리는 문제가 있다.

이를 해결하는 방법은 세션 스토리지가 아니라 cookies에 저장하여 SSR로 렌더링되게 하는 것이다.
먼저 이와 관련된 컴포넌트들을 dynamic import할 때에 'ssr'을 false로 두었던 것을 제거한다.

이후 아래와 같이 쿠키로 관리하도록 전환한다.

utils/cookies/post-page-cookie.ts

```tsx
export const POST_PAGE_COOKIE_KEYS = {
  AUTOSAVE: {
    isEditMode: "isEditMode",
    isMarkdownOn: "isMarkdownOn",
    isRawOn: "isRawOn",
  },
  SIDEBAR: {
    isSortable: "isSortable",
  },
} as const;

export type PostPageCookieKey =
  | (typeof POST_PAGE_COOKIE_KEYS.AUTOSAVE)[keyof typeof POST_PAGE_COOKIE_KEYS.AUTOSAVE]
  | (typeof POST_PAGE_COOKIE_KEYS.SIDEBAR)[keyof typeof POST_PAGE_COOKIE_KEYS.SIDEBAR];

export function setPostPageCookie(key: PostPageCookieKey, value: string) {
  document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
}
```

위와 같이 쿠키를 관리하는 유틸 함수를 만들고

components/post/autosave-store-wrapper.tsx

```tsx
export default async function PostMainWrapper({
  data,
  subcategoryId,
  categoryData,
  children,
}: PostMainWrapperProps) {
  const cookieStore = await cookies();
  const isEditMode =
    cookieStore.get(POST_PAGE_COOKIE_KEYS.AUTOSAVE.isEditMode)?.value ===
    "true";
  const isMarkdownOn =
    cookieStore.get(POST_PAGE_COOKIE_KEYS.AUTOSAVE.isMarkdownOn)?.value ===
    "true";
  const isRawOn =
    cookieStore.get(POST_PAGE_COOKIE_KEYS.AUTOSAVE.isRawOn)?.value === "true";
```

저장된 쿠키는 위와 같이 페이지 혹은 레이아웃에서 불러와 zustand의 initialState에 주입시킨다.

쿠키를 저장할 때에는 아래와 같다.

```tsx
    setIsEditMode: (value) => {
      setPostPageCookie("isEditMode", String(value));
      set({ isEditMode: value });
    },
    setIsMarkdown: (value) => {
      setPostPageCookie("isMarkdownOn", String(value));
      set({ isMarkdownOn: value });
    },
    setIsRaw: (value) => {
      setPostPageCookie("isRawOn", String(value));
      set({ isRawOn: value });
    },
```

### isSortable, isEditMode를 LootLayout으로

위와 같은 cookies처럼 서버 데이터에 접근하는 내용이 있으면 반드시 SSR로만 작동된다.

실제로 `export const dynamic = "force-static";`를 하면 cookies를 쓰지 말라고 에러를 발생시킨다.
현재는 기본값인 `export const dynamic = "auto";`를 쓰고 있는데, 미인증 사용자의 경우 데이터를 cache하고 있기 때문에 미인증 사용자에 한해서는 `"force-static"`처럼 작동하고, 인증된 사용자에 한해서만 `"force-dynamic"`처럼 작동한다.

이 상황에서...

두 가지 선택지를 고려해보았는데

1. ServerAction을 만들어서 cookies를 읽고 반환하는 serverAction을 만든다.
2. isEditmode, isSortable 등을 LootLayout으로 뺀다. **<- 채택**

애초에 `<LayoutStoreProvider>`를 만들었던 이유가 사이드바 등 레이아웃에 영향을 줄 수 있는 녀석들을 관리하기 위함이었고, 실제로 leftCollapsed 등이 잘 작동하고 있다.

리팩토링 -> 그냥 기본에 쿠키나 세션을 이용해서 관리하던거 다 지우고, isEditMode, isSortable을 LayoutStore로 옮겼음.

여기에 추가로, 해당 LayoutStore는 Post 페이지에서만 사용하고 있으니, 루트 레이아웃에 뒀던 LayoutStoreProvider를 지우고 아래와 같이 Post페이지의 레이아웃으로 옮긴다.

// app/post/layout.tsx

```tsx
import { LayoutStoreProvider } from "@/providers/layout-store-provider";

interface PostRootLayoutProps {
  children: React.ReactNode;
}

export default async function PostRootLayout({
  children,
}: PostRootLayoutProps) {
  return <LayoutStoreProvider>{children}</LayoutStoreProvider>;
}
```

### 레이아웃 관리 전략 정리

결과적으로 Post 페이지의 관리 전략은 아래와 같다

- 게시글을 이동해도 유지되어야 하는 레이아웃
  - /app/post/layout의 layoutStore에서 관리
  ```
    sidebarLeftCollapsed: false,
    sidebarRightCollapsed: false,
    rightPanelOpen: true,
    rightPanelMode: "summary",
    isEditMode: false,
    isMarkdownOn: false,
    isRawOn: false,
    isSortable: false,
  ```
- 게시글을 이동했을 때 초기 상태로 돌아와야 하는 레이아웃
  - /app/post/[urlSlug]/layout에서 관리 (sidebar-state의 mobileOpen 등)
  ```
    mobileOpen: false,
  ```

## 30일차 + 31일차

### 레이아웃 바운더리 원리 이해

지금까지 살펴본 바에 따르면, 상위 폴더에 있는 레이아웃은 상태가 초기화되지 않고, 하위 폴더에 있는 내용들만 언마운트/마운트 되면서 내용이 바뀌는 것을 확인할 수 있었는데, 이는 next.js가 레이아웃 바운더리(Layout Boundary, shared layout boundary, route segment boundary)를 가지고 있기 때문이다.

next js는 각 segement마다 layout과 page를 각기 ssg로 렌더링하여 캐싱하며,
최초 사용자가 접속 시에 이렇게 나뉘어진 segement별 html들을 병합하여 전송한다.

이후 사용자가 요청을 보낼 때마다, 변화가 있는 segement의 html만 주고 받는, 즉 Patial 렌더링(혹은 streaming) 방식으로 작동한다.

### 레이아웃 리팩토링

위와 같은 원리를 이용해 레이아웃을 리팩토링한다.

기존

```tsx
export default async function PostRootLayout({
  children,
}: PostRootLayoutProps) {
  return <LayoutStoreProvider>{children}</LayoutStoreProvider>;
}
```

```tsx
export default async function PostDetailLayout({
  params,
  children,
}: PostDetailLayoutProps) {
  const urlSlug = (await params).urlSlug || "";
  const { data } = await getSidebarCategory();
  const categories = data || [];
  const { data: PostsData } = await getSidebarPosts();
  const posts = PostsData || [];

  return (
    <PostSidebarWrapper categories={categories} urlSlug={urlSlug} posts={posts}>
      <div className="flex h-screen">
        <Sidebar categories={categories} posts={posts} />
        {children}
      </div>
    </PostSidebarWrapper>
  );
}
```

사이드바가 PostDetailLayout에 들어가있는데, 이렇게 되는 경우에는 모든 게시글들이 postSidebar와 관련된 html을 중복하여 캐싱하게 되며, 스트리밍을 할 때에도 함께 들어오게 된다.

따라서 아래와 같이 중복될 수 있는 부분을 rootlayout으로 보내야 한다.

```tsx
import { getSidebarCategory, getSidebarPosts } from "@/app/post/actions";
import { Sidebar } from "@/components/post/sidebar/post-sidebar";
import PostSidebarWrapper from "@/components/post/sidebar/post-sidebar-wrapper";
import { LayoutStoreProvider } from "@/providers/layout-store-provider";

interface PostRootLayoutProps {
  children: React.ReactNode;
}

export default async function PostRootLayout({
  children,
}: PostRootLayoutProps) {
  const { data } = await getSidebarCategory();
  const categories = data || [];
  const { data: PostsData } = await getSidebarPosts();
  const posts = PostsData || [];

  return (
    <LayoutStoreProvider>
      <PostSidebarWrapper categories={categories} posts={posts}>
        <div className="flex h-screen">
          <Sidebar categories={categories} posts={posts} />
          {children}
        </div>
      </PostSidebarWrapper>
    </LayoutStoreProvider>
  );
}
```

```tsx
interface PostDetailLayoutProps {
  params: Promise<{
    urlSlug?: string;
  }>;

  children: React.ReactNode;
}

export default async function PostDetailLayout({
  params,
  children,
}: PostDetailLayoutProps) {
  const urlSlug = (await params).urlSlug || "";

  return <>{children}</>;
}
```

위와 같이 변경하는 경우, urlSlug를 통해 선택된 카테고리와 선택된 게시글을 업데이트하는 로직이 제외되어 있다. 이때 필요한 것이 SidebarHydrator 이다.

```tsx
interface PostDetailLayoutProps {
  params: Promise<{
    urlSlug?: string;
  }>;

  children: React.ReactNode;
}

export default async function PostDetailLayout({
  params,
  children,
}: PostDetailLayoutProps) {
  const urlSlug = (await params).urlSlug || "";

  return <>{children}</>;
}
```

```tsx
"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";

interface SidebarHydratorProps {
  urlSlug?: string;
}

export default function SidebarHydrator({
  urlSlug = "",
}: SidebarHydratorProps) {
  const {
    categories,
    posts,
    setCategory,
    setSubcategory,
    setPost,
    setOpenCategory,
  } = useSidebarStore(
    useShallow((state) => ({
      categories: state.categories,
      posts: state.posts,
      setCategory: state.setCategory,
      setSubcategory: state.setSubcategory,
      setPost: state.setPost,
      setOpenCategory: state.setOpenCategory,
    }))
  );

  useEffect(() => {
    if (!categories || !posts) return;
    const decodedSlug = decodeURIComponent(urlSlug);
    const post = posts.find((p) => p.url_slug === decodedSlug);

    let selectedCategoryId = categories[0]?.id ?? null;

    if (post) {
      setPost(post.id);

      for (const category of categories) {
        const subcategory = category.subcategories.find(
          (sub) => sub.id === post.subcategory_id
        );

        if (subcategory) {
          selectedCategoryId = category.id;
          setCategory(category.id);
          setSubcategory({ id: subcategory.id, name: subcategory.name });
          setOpenCategory(category.id, true);
          break;
        }
      }
    } else {
      setCategory(selectedCategoryId);
    }
  }, [
    categories,
    posts,
    urlSlug,
    setCategory,
    setSubcategory,
    setPost,
    setOpenCategory,
  ]);

  return null;
}
```

SidebarHydrator는 urlSlug를 받아 사이드바 상태에 주입한다.

이와같이 리팩토링하는 경우, 최초 로딩시에 사이드바가 기본상태였다가 순간적으로 하이드레이션되는 과정을 겪게 된다.

하지만 최초 로딩 이후에는 post와 관련된 내용들만 partial하게 rendering하기 때문에 사이드바에 불필요한 렌더링이 사라지고, 서버에서 `post/[urlSlug]`들이 차지하는 캐싱데이터의 용량이 줄어들게 된다.

여기에 마지막으로 디테일을 잡아보자.

앞서 설명했듯, 최초 마운트시에 초기상태로 렌더링되었다가 하이드레이션이 되는 플리커링이 일어나 미관상 보기 좋지 않다.

loading이라는 플래그를 세워 스켈레톤을 보여주자.
loading의 초기값은 true이다.

```tsx
export function Sidebar({

}: {

}) {

  const {

    loading,
  } = useSidebarStore(
    useShallow((state) => ({

      loading: state.loading,
    }))
  );

  return
              {loading ? (
                <SidebarSkeleton />
              ) : (
                <WithSortableList items={categories}>
                  {(categories) =>
                    categories.map((cat) => (
                      <SidebarCategoryContent
                        key={cat.id}
                        catagory={cat}
                        setSidebarRightCollapsed={setSidebarRightCollapsed}
                        setSubcategory={setSubcategory}
                        selectedSubcategoryId={selectedSubcategoryId}
                      />
                    ))
                  }
                </WithSortableList>
              )}
```

스켈레톤은 아래와 같이 opacity-30, blur-sm 인 더미 텍스트들을 보여주도록 하였다. 또한 shimmer 효과를 주기 위한 animate pulse까지.

```tsx
export function SidebarSkeleton() {
  const dummyLines = [
    "송희는 들어 보고 싶다기보다",
    "버려 보고 싶었다.",
    "빈 봉을 쏘아 올리며",
    "한 계절을 보냈다.",
    "하체의 힘이 봉에 제대로 전달됐을 때 울리는,",
    "‘탕’ 하는 경쾌한 소리.",
    "진동하는 봉 안에서",
    "작은 링과 티끌 같은 것들이 구르며 내는 메아리.",
    "쌀알을 부어 넣은 페트병,",
    "아버지가 흔드는 은단통,",
    "혹은 수학여행지의 바다에서 들었던",
    "파도가 쓸어가는 굵은 모래 소리.",
    "- 김기태, 『무겁고 높은』, 2022",
  ];

  return (
    <div className="space-y-2 animate-pulse">
      {dummyLines.map((text, i) => (
        <p
          key={i}
          className="h-[36px] px-3 py-2 text-sm font-medium text-color-base opacity-30 blur-sm select-none"
        >
          {text}
        </p>
      ))}
    </div>
  );
}
```

마지막으로 sidebar-hydrator는

1. loading이 true일 때에는 선택된 카테고리, 선택된 게시글 등을 지정한다.
2. loading이 false일 때에는 선택된 카테고리와 선택된 게시글은 이미 지정되었을 것으로 보고 post만 지정하고 return한다.
3. 마지막으로, 모바일인 경우 글을 이동할 때마다 모바일 사이드바가 닫혀야 함으로, 모바일 사이드바에 한정해서는 마운트 이후에도 게시글이 바뀔 때마다 off로 하이드레이션을 한다.

```tsx
"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";

interface SidebarHydratorProps {
  urlSlug?: string;
}

export default function SidebarHydrator({
  urlSlug = "",
}: SidebarHydratorProps) {
  const {
...
    loading,
...
    setLoaded,
    setMobileClosed,
  } = useSidebarStore(
    useShallow((state) => ({
...
      loading: state.loading,
...
      setLoaded: state.setLoaded,
      setMobileClosed: state.setMobileClosed,
    }))
  );

  useEffect(() => setMobileClosed(), [setMobileClosed]);

  useEffect(() => {
    if (!loading) return;
    if (!categories || !posts) return;
...
    if (post) {
      setPost(post.id);

      if (!loading) return;
      for (const category of categories) {
...
    setLoaded();
  }, [

    loading,
    setLoaded,
  ]);

  return null;
}
```

## 31일차

### Image 태그 버그 수정 (empty string)

```
GET /post/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%ED%81%AC%EB%A3%A8%EC%8A%A4%EC%B9%BC-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EC%B5%9C%EC%86%8C-%EC%8B%A0%EC%9E%A5-%ED%8A%B8%EB%A6%AC 200 in 545ms
An empty string ("") was passed to the src attribute. This may cause the browser to download the whole page again over the network. To fix this, either do not render the element at all or pass null to src instead of an empty string.
```

비어 있는 string을 src로 넣으면 페이지를 새로 로딩하겠다는 협박을 당했다.  
그리고... 실제로 페이지가 무한로딩 되었다.  
일전에 이미지를 업로드하다가 멈춰서 blob으로 있던 이미지였다.

수정 전

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkParse, remarkBreaks]}
  rehypePlugins={[rehypeHighlight]}
  components={{
    img: ({ src = "", alt = "" }) => {
      return (
        <Image
          src={src}
          alt={alt}
          // https://stackoverflow.com/questions/69230343/nextjs-image-component-with-fixed-witdth-and-auto-height
          width="0"
          height="0"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-auto h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] xl:h-[340px]"
        />
      );
    },
  }}
>
  {children}
</ReactMarkdown>
```

수정 후

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkParse, remarkBreaks]}
  rehypePlugins={[rehypeHighlight]}
  components={{
    img: ({ src, alt = "" }) => {
      if (!src)
        return (
          <Image
            src={
              "data:image/svg+xml;base64," +
              "Cjxzdmcgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxNTAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjlmOWY5Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMzZweCI+4pqg77iP8J+YrTwvdGV4dD4KPC9zdmc+Cg=="
            }
            alt="image-error"
            width="0"
            height="0"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-auto h-[180px] shadow-glass"
          />
        );
      return (
        <Image
          src={src}
          alt={alt}
          // https://stackoverflow.com/questions/69230343/nextjs-image-component-with-fixed-witdth-and-auto-height
          width="0"
          height="0"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-auto h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] xl:h-[340px]"
        />
      );
    },
  }}
>
  {children}
</ReactMarkdown>
```

src에 디폴트 값이 들어 있던 것을 없애고 예외처리를 해주었다. SSR이 되기 때문에 Image나 img 태그가 아닌 다른 태그는 사용할 수가 없었고, 그래서 base64를 이용해서 플레이스 홀더를 만들어 주었다. 해당 베이스64는 귀여운 이모지가 나온다.

### 화면 전체를 관장하는 Loader 만들기

지금 현재 캐싱이 게시글로 이동할 때에는 즉각적이지만, 캐싱이 되지 않은 페이지로 이동할 따에는 시간이 오래 걸리는 문제가 있다.

그렇다고 /post/[urlSlug]에 loading.tsx를 넣는 경우 SSG 자체가 되지 않게 된다.

이를 해결하는 방법은 클라이언트 사이드에서 임시로 spinwheel을 보여줬다가 꺼줬다가 하는 방식으로 ux를 개선하는 것이다.

아래와 같이 zustand 상태를 만든다.

```tsx
import { createStore } from "zustand";

type LoadingState = "idle" | "pending" | "loading";

export interface RouteLoadingState {
  state: LoadingState;
  start: () => void;
  stop: () => void;
}

export const createRouteLoadingStore = (
  initialState?: Partial<RouteLoadingState>
) =>
  createStore<RouteLoadingState>((set, get) => {
    let timeout: NodeJS.Timeout; // timeout id를 저장하는 '비공개 상태'
    return {
      state: "idle",
      start: () => {
        clearTimeout(timeout);
        set({ state: "pending" });
        timeout = setTimeout(() => {
          if (get().state === "pending") {
            set({ state: "loading" });
          }
        }, 200);
      },
      stop: () => {
        clearTimeout(timeout);
        set({ state: "idle" });
      },
      ...initialState,
    };
  });
```

idle은 로딩이 완료된 상태
pending은 로딩 스핀휠을 노출시키기 전 200ms를 대기하는 상태
loading은 페이지 이동이 200ms보다 길어져서 로딩 스핀휠을 보여주고 있는 상태이다.

위 스토어의 detail은

1. setTimeout의 id를 `timeout`이라는 변수에 선언했다. 이와 같이 observe할 필요가 없는 상태들은 함수 내부에 변수로 지정하여 사용하는 것이 좋다. (클로저가...느껴지십니까?)
2. start는 실행될 때마다 clearTimeout(timeout)을 하여 Race Condition을 방지한다. Race Condition이 일어날 때에 후발주자를 막느냐 선발주자를 조지느냐의 문제인데, Loading UI의 기본 목적은 사용자가 지루하지 않게 하기 위함인 바, 클릭을 열심히 하는 사용자는 지루하지 않아 급할 이유가 없으므로 선발주자를 ClearTimeout 조져버린다.

Link 태그를 클릭할 때마다 Start 함수를 실행시키면 된다.

```tsx
export function LinkLoader(props: Props) {
  const { start } = useRouteLoadingStore(
    useShallow((state) => ({
      start: state.start,
    }))
  );

  return (
    <Link
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        start();
      }}
    />
  );
}
```

컴포넌트 명은 Link라고 했을때 자동완성이 되는걸 고려해서 지었다.

참고로 위의 링크는 버그가 하나 있는데, 자기 자신으로 이동하는 경우 무한 로딩이 걸린다.

Next의 Link의 Href는 string으로도 줄 수 있고, 객체로도 줄 수 있고, 객체에서 pathname 빼고 쿼리만 넣을 수도 있고... 별의 별 분기가 다 있는데 이걸 다 처리해주는건 오버해드가 있는 것 같다.

그래서 아래처럼 'href'가 pathname이랑 다르거나, href.pathname이 pathname과 다른 경우에만 start()를 실행하도록 예외처리를 넣어주었다. start()가 실행이 안되는 경우(가령 Link태그에 객체를 이용해 searchParams를 밀어넣는 경우 등)가 있지만, 적어도 start()가 너무 자주 실행되어서 무한 로딩보다는 낫다.

```tsx
      onClick={(e) => {
        onClick?.(e);
        if (
          (typeof href === "object" &&
            (href as UrlObject).pathname !== decodedPathname) ||
          (typeof href === "string" && href !== decodedPathname)
        ) {
          start();
        }
      }}
```

참고로 객체를 다룰 때에는 (typeof href === "object" &&)와 같이 타입 체크를 명시적으로 같이 해주는게 좋다. 그러지 않으면 예상치 못한 타이밍에 `[object obejct]`라는 녀석이 튀어나와서 꿈 속에서도 괴롭힌다.

이제 이 링크태그를 기존 Next/Link 태그를 대신하여 넣으면 된다.

```tsx
<LinkLoader href={`/post/${post.url_slug}`}>{post.title}</LinkLoader>
```

Link 태그를 LinkLoader로 변경함으로써 링크를 이동할 때마다 0.2초 후 loading이 된다.

이제 나머지 두 가지 기능이 필요한데.

1. loading 상태일 때 스핀휠을 보여준다.
2. 링크 이동이 완료된 경우 stop()을 실행시켜 idle로 변경한다.

이 두 가지를 RouteLoader라는 컴포넌트로 합쳤다.

```tsx
export function RouteLoader() {
  const pathname = usePathname();
  const { stop, state } = useRouteLoadingStore(
    useShallow((state) => ({
      stop: state.stop,
      state: state.state,
    }))
  );

  useEffect(() => {
    stop();
  }, [pathname, stop]);

  if (state !== "loading") return null;

  return (
    <div className="fixed inset-0 z-[100] md:z-30 flex items-center justify-center bg-glass-bg-20 backdrop-blur-sm">
      <div className="text-muted-foreground">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
```

위의 코드에서의 디테일은

```tsx
useEffect(() => {
  stop();
}, [pathname, stop]);
```

주소가 바뀔 때마다 stop()을 실행한다. (참고로 zustand의 setter는 static하기 때문에 useEffect 실행에 영향을 주지 않음)

`fixed inset-0 backdrop-blur-sm` - 화면 전체를 감싸고 blur로 흐릿하게 만든다
`md:z-30` z 인덱스는 30: 메인 콘텐츠의 요소들이 10, 20의 z-index를 쓴다. `drawer`와 `사이드바`는 z-index가 50이다. 따라서 이 사잇값인 30으로 z-index를 줘서 메인 콘텐츠 영역만 감추도록 한다.
`z-[100]` 모바일에서는 z-index가 100. 모바일 사이드바가 화면 전체를 가득 채우는데, z-index가 50이다. 따라서 50보다 큰 수를 넣어 사이드바보다 위로 나오게 한다.

### 캐싱 조건 만들기

로딩 ui를 만들고나서 느끼는건,
로그인 된 사용자는 무조건 캐싱을 안하도록 하는데, 너무 로딩이 많아서 힘들다.

그래서 '로그인은 됐지만, is_private이 아니면 캐싱을 하고싶어...'라는 생각.

그래서 withSupabaseCache의 skipCache에 대해 고민하기 시작했다.

일단 skipCache에 supabase client를 넘겨줘서 이를 사용하게 한다.

```ts
// 기존
  skipCache?: (params: P) => boolean;

// 수정
  skipCache?: (ctx: {
    supabase: SupabaseClient;
    params: P;
  }) => Promise<boolean>;
```

이제 supabase 클라이언트 자체를 넘겨주었기 때문에 로그인이 됐는지 게시글이 is_private인지 모두 다 확인할 수 있게 됐다.

그러고 나서... 자주 쓰이는 로직 (로그인 된 사용자면 skip cache)을 어떻게 추상화 할것인가에 대한 고민

1. 플러그인 방식

```ts
skipCache: applyPlugins([isLoggedIn(), postIsPrivate(postId)]);
```

applyPlugins에서 함수 배열을 순회하면서, 해당 배열에 ctx를 주입해가면서 실행한다.  
문제는 이 코딩 컨벤션이 계속 유지되기가 힘들다는 것.

```ts
skipCache: async ({ params }) => !!params.search,
skipCache: applyPlugins([
  isLoggedIn(),
  ({ params }) => !!params.search,
])
```

위와 같이 직접 skipCache의 함수를 커스텀으로 작성하는 경우가 종종 생길 것으로 보이며, 이를 방지하기 위해서는 새로운 로직을 작성할 때마다 plugin화 해야한다.

2. 팩토리 방식

```ts
skipCache: async ({ params, presets }) => {
  const isLoggedIn = await presets.isLoggedIn();
  const isSearching = !!params.search;
  return !isLoggedIn && !isSearching;
};
skipCache: async ({ params, presets }) =>
  presets.isLoggedIn() && presets.postNotPrivate(params.postId);
```

코딩의 자유도가 지나치게 높기는 한데, skipCache가 결과값으로 boolean을 반환하는 비동기 함수라는 점은 일관되게 유지되며, 복잡한 로직이 가능해진다. presets는 그저 유틸함수, helper 함수의 모음집일 뿐...

따라서 2번 팩토리 방식(내지는 전략 패턴...?) 으로 간다.

#### 팩토리 방식으로 기능확장

```tsx
export const makePresets = <P extends Record<string, unknown>>({
  supabase,
  params,
}: {
  supabase: SupabaseClient;
  params: P;
}) => {
  return {
    isLoggedIn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return !!session?.user;
    },
    isPrivatePost: async () => {
      const postId = params?.postId;
      if (typeof postId !== "string") return true;
      const { data } = await supabase
        .from("posts")
        .select("is_private")
        .eq("id", postId)
        .single();
      return data?.is_private === true;
    },
  };
};
```

params와 supabase를 받아서 유틸 함수를 만드는 makePresets를 만든다.

이때 한가지 최적화 문제가 있는데

makePresets는 supabase와 params에 의존성을 가지고 있기 때문에 싱글톤 패턴으로 만들지 못한다. 그래서 이 거대한 팩토리를 매 요청마다 만들게 된다.

차선책 : Lazy Getter를 이용한다. 이렇게 하면 팩토리 객체 자체는 만들어 지지만 내부의 함수들은 평가단계를 거치지 않는다.

```tsx
export const makePresets = <P extends Record<string, unknown>>({
  supabase,
  params,
}: {
  supabase: SupabaseClient;
  params: P;
}) => {
  return {
    get isLoggedIn() {
      return async () => {
        const { data } = await supabase.auth.getSession();
        return !!data.session?.user;
      };
    },
    get isPrivatePost() {
      return async () => {
        const postId = params?.postId;
        if (typeof postId !== "string") return true;
        const { data } = await supabase
          .from("posts")
          .select("is_private")
          .eq("id", postId)
          .single();
        return data?.is_private === true;
      };
    },
  };
};
```

Lazy Getter의 원리

- 객체가 생성될 때, 그 객체 안에 있는 프로퍼티와 메서드들은 즉시 평가되어 메모리에. 이를 데이터 프로퍼티라고 한다.

```js
const obj1 = {
  foo: () => {
    return 123;
  },
};
```

```js
console.log(Object.getOwnPropertyDescriptor(obj2, "foo"));
/*
  {
    get: [Function: get foo],
    set: undefined,
    enumerable: true,
    configurable: true
  }
*/
```

- 하지만 getter를 사용하면, getter 내부에 있는 값은 평가되지 않는다. getter와 setter를 접근자 프로퍼티라고 한다.

```js
const obj2 = {
  get foo() {
    return () => {
      return 123;
    };
  },
};
```

```js
console.log(Object.getOwnPropertyDescriptor(obj2, "foo"));
/*
{
  get: [Function: get foo],
  set: undefined,
  enumerable: true,
  configurable: true
}
*/
```

한편 현재로서는 접근자 프로퍼티의 성능상 이점이 크지 않아 굳이 사용할 필요가 없어 보이는데...  
접근자 프로퍼티의 특성을 활용해서 반환값을 즉시실행 함수로 하여 용이성을 높이도록 한다.

```tsx
export const makePresets = <P extends Record<string, unknown>>({
  supabase,
  params,
}: {
  supabase: SupabaseClient;
  params: P;
}) => {
  return {
    get isLoggedIn() {
      return (async () => {
        const { data } = await supabase.auth.getSession();
        return !!data.session?.user;
      })();
    },
    get isPrivatePost() {
      return (async () => {
        const postId = params?.postId;
        if (typeof postId !== "string") return true;
        const { data } = await supabase
          .from("posts")
          .select("is_private")
          .eq("id", postId)
          .single();
        return data?.is_private === true;
      })();
    },
  };
};
```

```tsx
// 즉시실행 이전
const loggedIn = await presets.isLoggedIn();
const isPrivate = await presets.isPrivatePost();

// 즉시실행 이후
const loggedIn = await presets.isLoggedIn;
const isPrivate = await presets.isPrivatePost;
```

즉시실행함수로 변환하여 해당 getter 들이 params를 받지 않음을 명확히 한다.

과도한 추상화이긴 하지만, preset을 통해 호출하는 경우 ctx의 params와 supabase를 조회할 필요가 없고, 별도의 실행을 할 필요도 없어 편의성이 높아지고 코드가 짧아졌다.

...
하지만 결국 과도한 추상화 문제로 타입에러도 많이나고 명시적이지 않아서 아래처럼 그냥 메서드 형식으로 받아서 쓰는 걸로...

```tsx
export const makePresets = () => {
  return {
    async isLoggedIn({ supabase }: { supabase: SupabaseClient }) {
      const { data } = await supabase.auth.getSession();
      return !!data.session?.user;
    },
    async isPrivatePost({
      supabase,
      params,
    }: {
      supabase: SupabaseClient;
      params: { postId?: string };
    }) {
      const { postId } = params;
      if (typeof postId !== "string") return true;
      const { data } = await supabase
        .from("posts")
        .select("is_private")
        .eq("id", postId)
        .single();
      return data?.is_private === true;
    },
  };
};
```

대신 presets 인스턴스는 skipCache 함수가 있을 때 생성하는 걸로 타협했다.

```ts
const shouldSkipCache =
  (await skipCache?.({ supabase, params, presets: makePresets() })) ||
  rawRevalidate === 0;
```

이렇게 리팩토링된 캐시 태그를 바탕으로 게시글 조회를 실행해봤는데 다행히 캐시가 잘 된다.

## 32일차 - 정적 페이지 생성 최적화

현재 로직은 잘 작동하나, cookies를 이용한 로직이기 때문에 정적 페이지 생성은 되지 않는다.
최 상단인 roolLayout 에 `export const dynamic = "force-static";` 를 넣어서 정적 페이지를 생성하도록 강제한다.

이후 하나씩 최적화해나간다.

### post page 정적 최적화

```tsx
import { getPostByUrlSlug } from "@/app/post/[urlSlug]/fetcher";
import PostPageRenderer from "@/components/post/page/page-renderer";
import RedirectTo from "@ui/redirect-to";

interface PageProps {
  params: Promise<{
    urlSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { urlSlug } = await params;
  const result = await getPostByUrlSlug({
    urlSlug: decodeURIComponent(urlSlug),
  });
  const { data } = result;

  // 데이터가 없거나, 비공개된 게시글이면 router.replace를 이용하는 클라이언트 컴포넌트로 클라이언트 쿠키와 함께 리다이렉트 시킴.
  if (!data || data.is_private) {
    return <RedirectTo to={`/post/${urlSlug}/private`} />;
  }

  return <PostPageRenderer data={data} />;
}
```

- PostPageRenderer는 기존 post page에서 data를 불러오는 로직을 제외한 나머지 부분이다.
- 게시글이 없거나, 비공개된 게시글이면 '/post/urlSlug/private'으로 리다이렉트 시킨다.
- 이때 렌더링 없이 307로 리다이렉트시키면 클라이언트 쿠키가 날아가서 슈파베이스가 작동을 안한다. 그래서 router.replce를 이용하는 클라이언트 컴포넌트를 통해 리다이렉트 시킨다.

```tsx
// 캐싱하지 않음
export default async function Page({ params }: PageProps) {
  const { urlSlug } = await params;
  const result = await getPostByUrlSlug({
    urlSlug: decodeURIComponent(urlSlug),
  });
  const { data } = result;

  // 게시글이 없으면 클라이언트에서 재시도
  if (!data) {
    return <RedirectTo to={`/post/${urlSlug}/private`} />;
  } else if (!data.is_private) {
    // 공개된 게시글이면 주소 변경
    return redirect(`/post/${urlSlug}`);
  }

  return <PostPageRenderer data={data} />;
}
```

post/urlSlug/private 페이지는 post/urlSlug 페이지와 딱 두 줄 다른데,

- `export const dynamic = "force-dynamic";`을 이용해서 정적 페이지를 생성하지 않는다.
- `!data.is_private`면 page/urlSlug로 이동시켜준다.
- `!data`일 때 자기 자신으로 리다이렉트를 한 번 시도한다.
  - `!data`일 때 자기 자신으로 한 번 리다이렉트를 시도하는 이유는, 클라이언트 쿠키를 받아오기 위함이다. 새로고침을 하거나, url에 직접 주소를 입력하는 경우에는 클라이언트 쿠키가 없다.

시행착오를 너무 많이 겪었지만...
추상화 수준도 적당하고 에러도 없이 잘 된다....ㅠㅠㅠ

### posts 및 search 페이지 정적 최적화

`posts` 페이지

```tsx
import { getPosts } from "@/components/posts/infinite-scroll/actions";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";

export default async function PostsPage() {
  const { data: postLists } = await getPosts({ page: 0 });

  return <PostsPageRenderer initialPosts={postLists || []} />;
}
```

`posts/search` 페이지

```tsx
export const dynamic = "force-dynamic";
import { getPosts } from "@/components/posts/infinite-scroll/actions";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ keyword: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const keyword = decodeURIComponent((await searchParams).keyword);
  if (!keyword) return redirect("/posts");

  const { data: postLists } = await getPosts({ page: 0, keyword });
  return <PostsPageRenderer keyword={keyword} initialPosts={postLists || []} />;
}
```

분리 작업에 큰 특이사항은 없었고,
무한 스크롤 하면서 초기 상태값 관련해서 이슈가 있어서 조금 수정했다.

### 캐싱 데이터 최적화 (벡터 테이블 분리)

벡터가 쓰이는 테이블들

- cluster
- ai summaries
- posts
  각 테이블들이 벡터를 쓰고 있어서 참으로 곤란쓰.

#### ai summaries에서 vector 분리

```sql
-- 새 테이블 생성
CREATE TABLE ai_summary_vectors (
  summary_id UUID PRIMARY KEY REFERENCES ai_summaries(id) ON DELETE CASCADE,
  vector VECTOR(1536)
);

-- 이관
INSERT INTO ai_summary_vectors (summary_id, vector)
SELECT id, vector FROM ai_summaries WHERE vector IS NOT NULL;

-- vector 칼럼 제거
ALTER TABLE ai_summaries DROP COLUMN vector;

-- view 생성
CREATE OR REPLACE VIEW ai_summaries_with_vectors AS
SELECT
  a.*,
  v.vector
FROM ai_summaries a
LEFT JOIN ai_summary_vectors v ON v.summary_id = a.id;
```

영향 받은 api
app/api/similarity/generate/route.ts => ai_summaries를 ai_summaries_with_vectors
app/api/summary/recommended/route.ts => ai_summaries, ai_summary_vectors, posts를 조인하도록 수정
app/api/summary/update/vectors/route.ts => ai_summaries_with_vectors에서 가져오고 ai_summary_vectors를 업데이트 하도록 수정
createAISummary 액션 => ai_summaries를 먼저 생성하고, ai_summary_vectors 생성시도
app/api/similarity/cluster/generate/route.ts => ai_summaries를 ai_summaries_with_vectors

#### posts에서 tsv 분리

1. posts 테이블에서 tsv를 별도의 테이블로 분리
2. posts 테이블에서 (post.is_private가 true가 아님 + post.is_deleted_at이 null임) 인 게시글만 조회하는 뷰를 생성
3. 뷰와 tsv를 join하여 조회하는 뷰를 생성
4. posts_with_tags_summaries의 이름을 변경하고 새로 생성

##### tsv 테이블 분리

```sql
-- 새로운 tsv 테이블 생성
CREATE TABLE post_tsvectors (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  tsv tsvector
);

-- tsv 테이블로 데이터를 이관
INSERT INTO post_tsvectors (post_id, tsv)
SELECT id, tsv FROM posts WHERE tsv IS NOT NULL;

-- tsv 테이블 내에 인덱스 생성
CREATE INDEX post_tsvectors_tsv_idx ON post_tsvectors USING GIN(tsv);
```

```sql
-- tsv 생성 트리거 삭제
DROP TRIGGER IF EXISTS tsv_update ON posts;

-- tsv 생성 함수 삭제
DROP FUNCTION IF EXISTS posts_tsv_trigger;

-- posts에서 tsv 칼럼 드랍
-- CASACADE로 영향 받는 뷰 posts_with_tags_summaries, subcategories_with_meta, clusters_with_posts
ALTER TABLE posts DROP COLUMN tsv CASCADE;

-- 새 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_post_tsvector()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO post_tsvectors (post_id, tsv)
  VALUES (
    NEW.id,
    setweight(to_tsvector(coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector(coalesce(NEW.body, '')), 'B')
  )
  ON CONFLICT (post_id)
  DO UPDATE SET tsv = EXCLUDED.tsv;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 새 트리거 생성
CREATE TRIGGER trg_update_post_tsvector
AFTER INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_post_tsvector();
```

의존성 있는 뷰들 :
posts_with_tags_summaries (=>published_posts_with_tags_summaries),
subcategories_with_meta (=>subcategories_with_published_meta),
clusters_with_posts

##### published_posts view / with_tags_summaries view

private이 아니고 삭제된 적 없는 게시글을 view로 생성

```sql
CREATE OR REPLACE VIEW published_posts AS
SELECT *
FROM posts
WHERE NOT is_private
  AND deleted_at IS NULL;
```

tag 및 ai요약 데이터와 조인
posts_with_tags_summaries=>published_posts_with_tags_summaries

```sql
CREATE OR REPLACE VIEW published_posts_with_tags_summaries AS
SELECT
  p.id,
  p.title,
  COALESCE(p.short_description, ais.summary) AS short_description,
  p.thumbnail,
  p.released_at,
  p.url_slug,
  COALESCE(
    ARRAY_AGG(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name
      )
    ) FILTER (WHERE t.id IS NOT NULL), ARRAY[]::jsonb[]
  ) AS tags,
  p.body,
  p.is_private,
  p.subcategory_id,
  p."order"
FROM published_posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
LEFT JOIN ai_summaries ais ON ais.post_id = p.id
GROUP BY
  p.id,
  p.title,
  p.short_description,
  p.thumbnail,
  p.released_at,
  p.url_slug,
  p.body,
  p.is_private,
  p.subcategory_id,
  p."order",
  ais.summary;
```

##### 검색용 view 생성

태그 및 ai 요약 데이터와 조인한 녀석을 tsv와 조인

```sql
CREATE OR REPLACE VIEW published_posts_with_tags_summaries_tsv AS
SELECT
  s.*,
  t.tsv
FROM published_posts_with_tags_summaries s
JOIN post_tsvectors t ON t.post_id = s.id;
```

supabase에서 검색용 rpc를 수정

```sql
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.short_description,
    v.thumbnail,
    v.released_at,
    v.url_slug,
    v.tags,
    CASE
      WHEN search_text = '' THEN NULL
      ELSE ts_headline(
        v.body,
        plainto_tsquery(search_text),
        'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,FragmentDelimiter=...,MaxWords=20,MinWords=5'
      )
    END AS snippet
  -- 기존에는 posts_with_tags_summaries
  FROM published_posts_with_tags_summaries_tsv v
  WHERE (v.is_private IS NULL OR v.is_private IS FALSE)
    AND (search_text = '' OR v.tsv @@ plainto_tsquery(search_text))
  ORDER BY v.released_at DESC
  OFFSET (page * page_size)
  LIMIT page_size;
END;
```

`git mv "components/posts/infinite-scroll/actions.tsx" "app/(app-shell)/posts/fetchers.ts"`

##### subcategories_with_meta 재생성

```sql
create or replace view subcategories_with_published_meta as
select
  s.category_id,
  s.created_at,
  s.description,
  s.id,
  s.name,
  s.url_slug,
  s."order",
  s.recommended,
  s.thumbnail,
  count(p.id) as post_count,
  max(p.released_at) as latest_post_date
from subcategories s
left join published_posts_with_tags_summaries p on p.subcategory_id = s.id
where s.deleted_at is null
group by
  s.category_id,
  s.created_at,
  s.description,
  s.id,
  s.name,
  s."order",
  s.recommended,
  s.thumbnail;
```

clusters_with_posts

#### 테이블명 변경 - cluster

clustered_posts_groups => clusters  
clustered_posts_groups_similarities => cluster_similarities  
clustered_posts_groups_with_posts => clusters_with_published_posts

##### clusters 의 vector 분리

```sql
CREATE TABLE cluster_vectors (
  cluster_id UUID PRIMARY KEY REFERENCES clusters(id) ON DELETE CASCADE,
  vector VECTOR(1536)
);

INSERT INTO cluster_vectors (cluster_id, vector)
SELECT id, vector FROM clusters WHERE vector IS NOT NULL;

ALTER TABLE clusters DROP COLUMN vector;

CREATE OR REPLACE VIEW clusters_with_vectors AS
SELECT
  c.*,
  v.vector
FROM clusters c
LEFT JOIN cluster_vectors v ON v.cluster_id = c.id;
```

##### cluster 생성용 RPC

/app/api/similarity/cluster/generate/route.ts => 생성용 RPC를 작성

```sql
CREATE OR REPLACE FUNCTION create_clusters_with_vectors(
  clusters JSONB
)
RETURNS TABLE (
  id UUID,
  vector VECTOR(1536)
) AS $$
DECLARE
  cluster_data JSONB;
  cluster_id UUID;
BEGIN
  FOR cluster_data IN SELECT * FROM jsonb_array_elements(clusters)
  LOOP
    cluster_id := gen_random_uuid();

    INSERT INTO clusters (
      id,
      title,
      summary,
      keywords,
      quality,
      post_ids
    )
    VALUES (
      cluster_id,
      cluster_data->>'title',
      cluster_data->>'summary',
      string_to_array(cluster_data->>'keywords', ','),
      (cluster_data->>'quality')::NUMERIC,
      (SELECT ARRAY_AGG(value::UUID) FROM jsonb_array_elements_text(cluster_data->'post_ids'))
    );

    INSERT INTO cluster_vectors (
      cluster_id,
      vector
    )
    VALUES (
      cluster_id,
      (cluster_data->>'vector')::vector
    );

    id := cluster_id;
    vector := (cluster_data->>'vector')::vector;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

##### 클러스터별 게시글

```sql
DROP VIEW IF EXISTS clustered_posts_groups_with_posts;
DROP VIEW IF EXISTS clusters_with_posts;

CREATE VIEW clusters_with_published_posts AS
SELECT
  g.id,
  g.title,
  g.post_ids,
  g.quality,
  g.summary,
  g.created_at,
  g.updated_at,
  g.keywords,
    count(p.*) AS post_count,
  json_agg(
    json_build_object(
      'id', p.id,
      'title', p.title,
      'short_description', p.short_description,
      'thumbnail', p.thumbnail,
      'released_at', p.released_at,
      'url_slug', p.url_slug,
      'tags', p.tags
    )
  ) AS posts
FROM clusters g
JOIN LATERAL (
  SELECT
    p.id,
    p.title,
    p.short_description,
    p.thumbnail,
    p.released_at,
    p.url_slug,
    p.tags
  FROM published_posts_with_tags_summaries p
  WHERE p.id = ANY (g.post_ids)
) p ON true
GROUP BY
  g.id, g.title, g.post_ids, g.quality, g.summary, g.created_at, g.updated_at, g.keywords;
```

##### cluster 게시글 목록 최적화

게시글 120개를 보면서
스크롤링하면 스크롤에 따라서 지도랑 헤더가 바뀌는 개쩌는 구조를 만들었는데

게시글 120개를 미리 캐싱해두고, 접속할 때 미리 불러오는게 너무 에바였다.

아쉽지만....120개 스크롤은 굿바이
선택된 군집이 바뀔 때 마다 게시글을 한번씩 불러오는 것으로 했다.

다 지우고 나서 보니 아무래도 아쉬워서 게시글 목록 위, 아래에 인터섹션 옵저버를 넣고 카테고리가 이동되도록 추가했다.

## 33일차

### 사이드바 정적 최적화

사이드바에 있는 120개의 개시글을 따로따로 분리하는걸 생각했는데,
이렇게 했더니 사이드바의 카테고리를 선택할 때마다 게시글을 불러오는 요청을 보냈고,
전혀 캐싱이 되지 않았다.

따라서 120개의 게시글을 한번에 불러오는 로직은 그대로 두되, 아래와 같이 개선하였다.

1. 로그인 된 사용자의 경우, 전체 게시글에 비공개 게시글을 추가하는 로직을 넣는다.
2. sidebar hydrator를 상위 layout 단으로 끌어올려 리렌더링을 최소화 한다. (기존엔 urlSlug가 바뀔 때마다 사이드바 전체가 리렌더링됨)
3. 게시글을 비공개->공개로 수정하는 경우에만 반응하도록, 전체 게시글에서 공개된 게시글의 숫자가 변할 때에만 hydrator가 한번 더 렌더링을 시도한다.

그 밖에 사이드바에 있는 카테고리가 수정되는 경우에는 데이터가 revalidate 되어 화면 전체가 리렌더링 되므로 별도의 로직은 추가하지 않았다.

## 34일차 + 35일차

### server actions 리팩토링 -> fetchers, actions로 분리

revalidate가 있는, CRUD 중 CUD만 actions로 칭하고,
나머지 read 요청들은 fetchers로 분류하였다.

그리고 post 페이지에서는 actions가 분류가 제대로 되어있지 않아 관리가 까다로웠는데, 각각 cateogry, post, ai 등의 파일로 분리하고 아래와 같이 actions/index.ts에서 불러왔다.

```ts
export * from "@/app/post/fetchers/sidebar";
export * from "@/app/post/fetchers/ai";
export * from "@/app/post/fetchers/post";
```

## 36일차

### 수정/삭제 등을 드랍다운 + 다이알로그로 리팩토링

`components/dialogs/sidebar-content-dropdown/sidebar-content-dropdown.tsx`  
드랍다운은 잘 구현이 됐는데,  
문제는 드랍다운이 닫히면서 팝오버, 다이알로그 등이 같이 닫히는 문제가 있다.  
일단 다이알로그로 리팩토링을 완료했고,  
다이알로그를 다이알로그 내부의 상태로 관리하는 것이 아니라, 다이알로그 외부의 상태로 관리 + dialogOpen이 false일 때에 useEffect로 클린업 하도록 수정하였다.

```ts
useEffect(() => {
  // 다이알로그가 pointer-events: none을 넣는 것을 수동으로 클린업
  if (!updateOpen) {
    document.body.style.pointerEvents = "auto";
    document.body.removeAttribute("inert");
  }
}, [updateOpen]);

if (!isSortable) return null;
return (
  <>
    <SidabarContentDropdownApp
      setUpdateOpen={() => setUpdateOpen(true)}
      setDeleteOpen={() => setUpdateOpen(true)}
    />
    {updateOpen && (
      <Dialog defaultOpen={true} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수정</DialogTitle>
          </DialogHeader>
          {children({ onClose: () => setUpdateOpen(false) })}
        </DialogContent>
      </Dialog>
    )}
  </>
);
```

그 밖에 updateForm과 deleteForm을 넘겨받고 싶어서 함수형 children 구조에서 slot 구조로 변경하였다.

```tsx
<SidebarContentDropdown
  slots={{
    update: ({ onClose }) => <PostUpdateForm post={post} onClose={onClose} />,
    delete: () => <></>,
  }}
/>
```

이렇게 넘겨주면

```tsx
{
  dialogOpen && (
    <Dialog defaultOpen={true} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          {mode === "update" && <DialogTitle>수정</DialogTitle>}
          {mode === "delete" && <DialogTitle>삭제</DialogTitle>}
        </DialogHeader>
        {slots[mode]({ onClose: () => setDialogOpen(false) })}
      </DialogContent>
    </Dialog>
  );
}
```

이렇게 `slots[mode]` 형태로 불러다가 쓸 수 있다.

### 클라이언트 사이드 업데이트

force-static으로 데이터를 SSG 로 캐싱한 상태에서는 revalidate가 있어도 현재 접속된 사용자는 반영되지 않는다.  
사실 생성/수정/삭제 기능을 나만 쓸꺼긴 한데, 내가 불편해서 수정한다.

카테고리 생성 시에 zustand 상태 'categoriesPending'을 true로 한다.
이 true를 받으면 카테고리 목록을 불러와 category를 업데이트 한다.

이러한 fetcher는 기존 `_getSidebarCategory` 함수를 getClientSidebarCategory로 이름을 바꿔 별도의 파일로 분리하여 사용하였다.

### RLS 정책 및 jwt

여기서 `auth.jwt()) ->> 'sub' = user_id::text`의 의미는 다음과 같다.

1. auth.jwt 토큰에서 sub를 가져온다. sub는 문자열 형식의 user_id 이다.
2. 'sub' = user_id인지 체크한다.
3. 이때 user_id는 uuid 형식이므로 이를 ::text 를 이용해서 text 형식으로 바꾼다.

```sql
-- 🔥 POSTS 테이블
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Read access with public/private logic" ON posts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON posts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON posts;

CREATE POLICY "Read access with public/private logic"
ON posts
FOR SELECT
TO public
USING (
    NOT is_private
    OR user_id = auth.uid()
);

CREATE POLICY "Enable update for users based on user_id"
ON posts
FOR UPDATE
TO public
USING (
  (SELECT auth.jwt()) ->> 'sub' = user_id::text
)
WITH CHECK (
  (SELECT auth.jwt()) ->> 'sub' = user_id::text
);

CREATE POLICY "Enable delete for users based on user_id"
ON posts
FOR DELETE
TO public
USING (
  (SELECT auth.jwt()) ->> 'sub' = user_id::text
);

-- 🔥 CATEGORIES 테이블
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON categories;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON categories;
DROP POLICY IF EXISTS "Read access with public/private logic" ON categories;

CREATE POLICY "Read access with public/private logic"
ON categories
FOR SELECT
TO public
USING (
  true
);

CREATE POLICY "Enable update for users based on user_id"
ON categories
FOR UPDATE
TO public
USING (
  (SELECT auth.jwt()) ->> 'sub' = user_id::text
)
WITH CHECK (
  (SELECT auth.jwt()) ->> 'sub' = user_id::text
);

CREATE POLICY "Enable delete for users based on user_id"
ON categories
FOR DELETE
TO public
USING (
  (SELECT auth.jwt()) ->> 'sub' = user_id::text
);

-- 🔥 SUBCATEGORIES 테이블
DROP POLICY IF EXISTS "Enable read access for all users" ON subcategories;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON subcategories;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON subcategories;
DROP POLICY IF EXISTS "Read access with public/private logic" ON subcategories;

CREATE POLICY "Read access with public/private logic"
ON subcategories
FOR SELECT
TO public
USING (
  true
);

CREATE POLICY "Enable update for users based on user_id"
ON subcategories
FOR UPDATE
TO public
USING (
  (SELECT auth.jwt()) ->> 'sub' = user_id::text
)
WITH CHECK (
  (SELECT auth.jwt()) ->> 'sub' = user_id::text
);

CREATE POLICY "Enable delete for users based on user_id"
ON subcategories
FOR DELETE
TO public
USING (
  (SELECT auth.jwt()) ->> 'sub' = user_id::text
);
```

### 카테고리, 서브카테고리 생성/수정/삭제

구현 완료.....

문제는 form이 6개나 나왔다.

form을 어떻게 관리하는게 좋은지 zod 등을 통해서 공부 해야하는데;...ㅠㅠ

카테고리는

- 사이드바에서 생성버튼
- 카테고리 옆에서 수정/삭제 버튼
- 카테고리의 subcategories가 있으면 삭제불가

서브카테고리는

- 열려있는 사이드바에서 생성버튼
- 서브카테고리 옆에서 수정/삭제 버튼
- posts 중 해당 subcategory를 참조하는 posts가 하나라도 있으면 삭제불가
- 생성/수정 시, url_slug가 없으면 slugify(이름)을 url_slug로

## 37일차, 38일차 배포 게시글 생성 기능

### 게시글 생성 기능

간단하다고 미뤄왔는데 은근히 사용성 이슈가 많았던 기능

`components/dialogs/post-forms/post-create-form.tsx`  
게시글 생성 시 로직을
"신규 게시글 생성"-"url slug에 맞춰서 이동"-"posts를 pending 상태로 바꾸어서 업데이트"로 조정하였다.  
또한 게시글 수정모드가 아닌 상황에서는 MD수정모드를 기본으로 켜도록하였다.

`components/dialogs/post-forms/post-delete-form.tsx`  
게시글 삭제 시에는 남아있는 게시글 중 하나로 이동하도록 하였고, 이때 posts가 pending 상태로 먼저 넘어가서 다른 게시글을 가져오는 일이 없도록 setTimeout을 살짝 넣어줬다.

### Fetcher 리팩토링

| 항목                      | `fetch()`                                          | `unstable_cache()`                             |
| ------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| **ISR 캐싱 대상**         | ✅ Vercel CDN에 자동 저장                          | ❌ CDN 캐싱 안 됨                              |
| **캐싱 위치**             | Vercel Edge Network CDN                            | Next.js 내부 메모리/디스크                     |
| **사용 목적**             | 외부/내부 API 호출                                 | 함수 실행 결과를 메모이즈                      |
| **`revalidate` 지원**     | ✅ `next: { revalidate }`                          | ✅ `revalidate` 옵션 있음                      |
| **정적 페이지 캐시 연동** | ✅ 자동 연동 (ISR 가능)                            | ❌ 자동 연동 안 됨 (페이지는 캐시 안 됨)       |
| **캐시 무효화 방식**      | `revalidateTag()`, `POST /revalidate` 등           | 직접 `key` 바꾸거나 서버 재시작                |
| **`force-static` 지원**   | ✅ 지원                                            | ❌ 지원 안 함                                  |
| **사용 위치**             | Server Component or Route Handler                  | 주로 `server-only` 함수 내부                   |
| **예시**                  | `fetch("/api/data", { next: { revalidate: 60 } })` | `unstable_cache(fetchFn, key, { revalidate })` |

지금까지 fetch 대신 unstable_cache를 써왔는데,
문제는 이게 ISR 같은건 작동을 안한다는 것이다. (그래서 기존에 force-static을 해야만 캐싱이 되는 상황이었음)

그래서 Fetch 함수를 사용하도록 모두 바꾸고, 애써 만들어왔던 unstable_cache는 삭제했다.

그렇다고 이게 뻘짓은 아니었던게, Route Handler를 이용하는 fetch 방식은 응답의 자동완성 등에서 사용자 경험이 좋지 않다. 때문에 unstable_cache로 만들어둔 함수를 route handler로 옮겨서 실행하는 방식은 꽤나 의미있었다.

### 배포 중 404 에러

Route Handler가 없는 경우에 vercel이 배포 도중 서버에서 404 에러를 반환하고, 이 404 에러를 JSON으로 반환하는 도중에 JSON 반환 에러를 뱉어내면서 결과적으로 500 internal server error가 반환된다.

Route handler를 먼저 구현하고, page를 구현하는 방식이 이상적이겠으나,  
현실적으로 어려움이 있어 404 에러일 때에 일단 Fail Silently를 하면서 일단 지나간 후,
다시 한 번 redeploy를 하면 해결된다.

### non-ascii url 에러

vercel의 cdn 서버는 non-ascii한 url을 제대로 핸들링하지 못한다.  
그래서 non-ascii한 url은 서버에 캐싱을 하지 못하고 404/500 에러를 뱉어 낸다.

url_slug 전체를 url-friendly한 url_slug로 변경하였다.

슈퍼베이스에서 특정 테이블의 칼럼을 변경할 때에는

1. temp 테이블 하나 만들기
2. csv로 데이터 업로드하기
3. UPDATE 테이블 명령어로 업데이트 해버리고, temp 테이블은 drop 시키기
   이 방식이 편하다

### CDN 캐시 날리기

vercel에서 배포한 이후 CDN 캐시가 남아 있어서 페이지의 변경사항이 변경되지 않는 경우들이 있다.

- **Vercel Dashboard > 프로젝트 > Settings > Data Cache**
- 거기서 **"Purge Everything"** 클릭
- 경고창 뜨면 **"Continue & Purge Everything"** 누르기

### 구글 클라우트 플랫폼에 주소 등록

크으 정확히 알고 물어봤다.

---

### Google OAuth에서 **Redirect URI (localhost 외)** 추가하는 법

1. [🔗 Google Cloud Console](https://console.cloud.google.com/) 접속

2. 좌측 메뉴에서 **"APIs & Services" → "Credentials"** 클릭

3. OAuth 클라이언트 ID 항목에서 **네 프로젝트의 "OAuth 2.0 Client IDs" 클릭**

4. 승인된 자바스크립트 원본에 주소 추가:

   예시:

   ```
   http://localhost:3000
   https://your-domain.vercel.app
   ```

5. **"Save" 클릭**

콜백은 supabase를 사용하고 있어서 수정할 필요는 없었다.

### SUPABASE에서 oauth redirect url 등록

supabase.auth는 아래와 같은 방식으로 사용하게 된다.

```ts
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google", // Google OAuth 로그인
  options: { redirectTo: `${window.location.origin}/callback` },
});
```

이 'redirectTo'의 주소가 supabase에 등록되어 있어야 정상작동한다.

supabase - project - authentification - url configuration
`https://supabase.com/dashboard/project/{projectId}/auth/url-configuration`

해당 위치에 기본적으로 Site URL만 등록이 되어 있는데, `Redirect URLs`에 없는 주소는 siteUrl로 이동하게 된다.

Redirect URLs에 아래 두 주소를 추가했다.

```
http://localhost:3000/callback
https://choi-devlog-project.vercel.app/callback
```
