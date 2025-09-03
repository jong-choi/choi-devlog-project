# 개요

`components/admin/admin-post-table-renderer.tsx`와 `components/admin/admin-posts-table.tsx`에서 구현된 데이터 갱신 로직에 관한 설명

## 참조

- **`useRouter` Hook & `router.refresh()`**: [Next.js Docs - `useRouter`](https://nextjs.org/docs/app/api-reference/functions/use-router)
- **Caching & Data Fetching**: [Next.js Docs - Caching and Revalidating](https://nextjs.org/docs/app/building-your-application/caching)

---

## router.refresh()

> `router.refresh()`: 현재 경로를 새로고침합니다. 서버에 새로운 요청을 보내고, 데이터 요청을 다시 가져오며, 서버 컴포넌트를 다시 렌더링합니다. 클라이언트는 영향을 받지 않는 클라이언트 측 React(예: `useState`) 또는 브라우저 상태(예: 스크롤 위치)를 잃지 않고 업데이트된 React 서버 컴포넌트 페이로드를 병합합니다.
> 공식문서 발췌

## 구현 코드

서버 컴포넌트에서 데이터를 패칭하여 내려준다

```tsx
// components/admin/admin-post-table-renderer.tsx
const { data: allPosts } = await fetch(
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin`,
).then((response) => response.json() as Promise<ApiResponse>);
```

클라이언트 컴포넌트에서는 데이터 업데이트 후 revalidate 및 refresh를 실행한다

```tsx
// components/admin/admin-action-buttons.tsx
const handleCreateSimilarity = async () => {
  setLoading(true);

  try {
    const response = await fetch("/api/summary/recommended", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId: post.id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || "추천 게시글 생성에 실패했습니다.");
      return;
    }

    await response.json();

    await revalidateCacheTags([CACHE_TAGS.AI_SUMMARY.BY_POST_ID(post.id)]); // 문자열을 받아 revalidate 하는 함수
    router.refresh(); // router.refresh 실행
  } catch (error) {
    console.error("추천 게시글 생성 오류:", error);
    toast.error("추천 게시글 생성 중 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};
```
