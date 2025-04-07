import { getPosts } from "@/components/posts/infinite-scroll/actions";
import { InfinitePostsStoreProvider } from "@/providers/infinite-posts-provider";
import InfiniteScrollPosts from "@/components/posts/infinite-scroll/infinite-scroll-posts";
import SearchHydrator from "@/components/posts/infinite-scroll/search-hydrator";
import SearchInput from "@/components/posts/infinite-scroll/search-input";

import { withJosa } from "@/utils/withJosa";
import { ChevronLeft } from "lucide-react";
import { PageContainer } from "@ui/glass-container";
import { LinkLoader } from "@ui/route-loader";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const isSearching = !!search && typeof search === "string";
  const { data: postLists } = await getPosts({ page: 0, search });

  return (
    <PageContainer>
      <SearchInput />
      {isSearching && (
        <p className="flex gap-2 flex-col">
          <LinkLoader
            className="text-sm text-color-muted hover:text-color-base flex items-center"
            href="/posts"
          >
            <ChevronLeft className="w-4 h-4" /> 전체 게시글 보기
          </LinkLoader>
          <span className="text-sm text-color-base">
            {" "}
            {`${withJosa(`"${search}"`, ["으로", "로"])} 검색한 결과입니다.`}
          </span>
        </p>
      )}
      <InfinitePostsStoreProvider
        initialState={{
          posts: postLists || [],
          search: search,
          page: 1,
          hasMore: !!postLists && postLists.length > 0,
        }}
      >
        <InfiniteScrollPosts />
        <SearchHydrator />
      </InfinitePostsStoreProvider>
    </PageContainer>
  );
}
