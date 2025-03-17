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

- `components/post/main/post-controller/autosave/autosave-wrapper.tsx`
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
