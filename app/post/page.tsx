import { getPosts } from "@/components/post/infinite-scroll/actions";
import { InfinitePostsStoreProvider } from "@/components/post/infinite-scroll/infinite-posts-provider";
import InfiniteScrollPosts from "@/components/post/infinite-scroll/infinite-scroll-posts";
import SearchHydrator from "@/components/post/infinite-scroll/search-hydrator";
import SearchInput from "@/components/post/infinite-scroll/search-input";
import { TopBar } from "@/components/post/topBar/post-top-bar";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const isSearching = !!search && typeof search === "string";
  const initialPosts = await getPosts({ page: 0, search });

  return (
    <div className="md:h-screen flex flex-col bg-background text-foreground font-sans">
      <TopBar />
      <main className="w-full py-4 md:py-8 overflow-y-scroll">
        <div className="w-full lg:max-w-screen-xl mx-auto flex flex-col gap-6">
          <SearchInput />
          {isSearching && (
            <p className="flex gap-2">
              <span className="text-sm text-color-base">{`"${search}"로 검색한 결과입니다.`}</span>
              <Link
                className="text-sm text-color-muted hover:text-color-base"
                href="/post"
              >
                전체 게시글 보기
              </Link>
            </p>
          )}
          <InfinitePostsStoreProvider
            initialState={{
              posts: initialPosts,
              search: search,
              page: 1,
              hasMore: initialPosts.length > 0,
            }}
          >
            <InfiniteScrollPosts />
            <SearchHydrator />
          </InfinitePostsStoreProvider>
        </div>
      </main>
    </div>
  );
}
