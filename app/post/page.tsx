import { getPosts } from "@/components/post/infinite-scroll/actions";
import { InfinitePostsStoreProvider } from "@/components/post/infinite-scroll/infinite-posts-provider";
import InfiniteScrollPosts from "@/components/post/infinite-scroll/infinite-scroll-posts";
import SearchHydrator from "@/components/post/infinite-scroll/search-hydrator";
import SearchInput from "@/components/post/infinite-scroll/search-input";
import { TopBar } from "@/components/post/topBar/post-top-bar";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const isSearching = !!search && typeof search === "string";
  const initialPosts = await getPosts(
    isSearching ? { page: 0, search } : { page: 0 }
  );

  return (
    <div className="md:h-screen flex flex-col bg-background text-foreground font-sans">
      <TopBar />
      <main className="w-full py-4 md:py-8 overflow-y-scroll">
        <div className="w-full lg:max-w-screen-xl mx-auto flex flex-col gap-6">
          <SearchInput />
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
