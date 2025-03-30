import { getFeed } from "@/components/post/cluster/actions";
import { PostCard } from "@/components/post/post-list/post-card";
import { TopBar } from "@/components/post/topBar/post-top-bar";

export default async function Page() {
  const postListData = await getFeed();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      <TopBar />
      <main className="w-full lg:max-w-screen-xl mx-auto flex flex-col gap-8 py-4 md:py-8">
        <div className="flex flex-col gap-6">
          {postListData.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
}
