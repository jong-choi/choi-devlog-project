import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { PageContainer } from "@ui/glass-container";
import { LinkLoader } from "@ui/route-loader";
import InfiniteScrollPosts from "@/components/posts/infinite-scroll/infinite-scroll-posts";
import SearchInput from "@/components/posts/infinite-scroll/search-input";
import { PostCard } from "@/components/posts/post-card";
import { InfinitePostsStoreProvider } from "@/providers/infinite-posts-provider";
import { CardPost } from "@/types/post";
import { withJosa } from "@/utils/withJosa";

interface PostsPageRendererProps {
  keyword?: string;
  initialPosts: CardPost[];
}

export default function PostsPageRenderer({
  keyword,
  initialPosts,
}: PostsPageRendererProps) {
  const isSearching = !!keyword;
  return (
    <PageContainer>
      <Suspense>
        <SearchInput />
      </Suspense>
      {isSearching && (
        <div className="flex gap-2 flex-col">
          <LinkLoader
            className="text-sm text-color-muted hover:text-color-base flex items-center"
            href="/post"
          >
            <ChevronLeft className="w-4 h-4" /> 전체 게시글 보기
          </LinkLoader>
          <span className="text-sm text-color-base">
            {`${withJosa(`"${keyword}"`, ["으로", "로"])} 검색한 결과입니다.`}
          </span>
        </div>
      )}
      {initialPosts.map((post) => (
        <PostCard key={post.id + "initial"} post={post} />
      ))}
      <InfinitePostsStoreProvider
        initialState={{
          posts: [],
          keyword: keyword,
          page: 1,
          hasMore: !!initialPosts && initialPosts.length > 0,
        }}
      >
        <InfiniteScrollPosts keyword={keyword} />
      </InfinitePostsStoreProvider>
    </PageContainer>
  );
}
