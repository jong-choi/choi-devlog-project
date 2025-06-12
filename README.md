# 기술블로그 scribbly

WYSIWYG으로 작성하고, 인공지능으로 게시글을 분류하는 프론트엔드 기술블로그입니다.\
[Velog 블로그](https://velog.io/@bluecoolgod80)의 게시글을 포크하여 만들어졌습니다.

URL : [devlog.me.uk](https://devlog.me.uk/)\
[➡ 블로그 개발일지](public/blog-devlog/README.md)\
[➡ Next JS 보일러 플레이트 프로젝트](https://github.com/jong-Choi/next-supabase-boilerplate)

## 프로젝트 기간

프로젝트 시작일 : 2025.03.12\
프로젝트 1차 배포 : 2025.05.07

## 프로젝트 목표

#### Problem

- [Velog 블로그](https://velog.io/@bluecoolgod80)를 기술 블로그로 운영해왔으나, 게시글이 많아지면서 Velog의 게시글 분류 및 게시글 검색의 단점이 크게 느껴졌다.
- Velog는 Markdown을 Raw로 편집하는 바, Markdown과 렌더링된 결과물 사이에 차이가 존재한다. 이를 Typora와 같은 WYSIWYG으로 편집하고, 블로그 화면에 즉각적으로 반영하는 경험을 원했다.

#### Solution

- 마크다운 편집 라이브러리인 [Milkdown](https://milkdown.dev/)을 이용한 WYSIWYG 마크다운 블로그를 만들고자 하였다.&#x20;
- 블로그에 맞게 SSG에 특화된 Next.js 15를 이용하여 성능 최적화 및 페이지 캐싱에 신경쓰고자 하였다.
- 전체적인 사용자 경험은 원노트와 에버노트 같은 간결함을 추구하되, 편집모드로 넘어가기 위한 토글 버튼을 둬 성능 최적화가 이루어질 수 있도록 하였다.
- Next.js 15와 궁합이 좋은 Supabase를 이용하여 게시글 검색 및 분류, 이미지 업로드 등의 백엔드 서비스를 구현하는 한편, 서버리스 프론트엔드와 같은 개발자 경험을 추구하였다.
- 그 밖에 OpenAI의 API를 이용하여 게시글을 요약하고, 분류하고, 학습 주제를 추천하도록하여 방문자들의 사용자 경험 및 스스로의 학습에 도움이 되도록 구현하였다.

## 기술 스택

- Next.js 15 (App Router, RSC)
- Supabase (Auth, Storage, Database)
- Vercel (배포)
- Zustand, Tailwind CSS, Shadcn/ui 등

## 주요 기능

### WYSWYG 에디터 / 자동저장

![1.00](https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image/posts/9dae3106-6e55-4cdf-8bc5-01c8bb02f48d-Screenshot_2025-06-07_08-20-45.png)

- [마크다운 편집 프레임워크 Milkdown](https://milkdown.dev/)을 이용하여 WYSWYG으로 편집이 가능하도록 하였다.
- 게시글은 [react-remark](https://github.com/remarkjs/react-remark)를 이용하여 view모드를 SSR로 구현하였다.
- 게시글을 실시간으로 편집할 때에는 IndexedDB를 이용해 로컬에 임시 저장된다.
- [CodeMirror](https://codemirror.net/) RAW 모드 및 DUO 모드를 통해 편집중인 게시글의 Markdown RAW를 확인할 수 있다.

### 사이드바 DND

![1.00](https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image/posts/6f910d8a-a159-4426-bb29-12b13aa87f7d-Screenshot_2025-06-07_08-25-07.png)

사이드바 역시 '편집' 모드를 토글하면 새로운 기능이 활성화되는데

1. 드래그 앤 드롭을 통해 게시글 및 분류의 순서를 변경할 수 있다.
2. 게시글 및 분류명을 수정하거나, 분류를 삭제할 수 있다.

사이드바의 ui에는 [dnd-kit](https://dndkit.com/)과 [shadcn](https://ui.shadcn.com/)이 사용되었다.

### AI 요약

![1.00](https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image/posts/f8361b08-7026-4048-94b5-334179e804e8-Screenshot_2025-06-07_08-30-40.png)

- OpenAI `GPT-4o`를 통해 게시글을 요약하고 추천 학습주제를 추천한다. 추천 학습 주제를 통해 더 공부하면 좋은 주제나 모르는 개념이 없는지 체크할 수 있다.
- 요약은 OpenAI의 `text-embedding-3-small`를 통해 벡터화되며, 추천 게시글 검색이나 분류 등에 사용된다.

### 지식 여정 지도

![1.00](https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image/posts/78b872a8-7613-4128-957c-5a1417e22fc5-Screenshot_2025-06-07_08-34-31.png)

- 게시글 요약들을 DBSCAN으로 분류한 지도이다.
- 각 군집 간의 유사도도 함께 표시하여 지금까지 학습한 내용들과 그 연관성을 지도로 확인할 수 있다.

### 검색

![1.00](https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image/posts/d7a7820c-597d-42eb-81c1-618855ff4111-Screenshot_2025-06-07_08-37-14.png)

- PostgresSQL의 Text Full Search를 이용하여 어절 단위 검색 및 스니펫을 지원하여 게시글 검색의 정확도를 높였다.

#### UI/UX

- 게시글 페이지를 왼쪽에 게시글 목록(SNB) / 가운데에 게시글 / 오른쪽엔 인공지능 요약 패널(Aside)의 3단 레이아웃으로 구성하였다.
- 양측 사이드를 반투명한 패널로하여 Glassmorphism으로 구현하였고, Frosted Glass를 강조하기 위해 배경에는 움직이는 도형을 추가하였다.
