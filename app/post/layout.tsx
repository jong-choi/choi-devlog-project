import PostTopBar from "@/components/post/topBar/post-top-bar";

interface PostLayoutProps {
  params?: Promise<{ postId: string }>;
  children: React.ReactNode;
}

export default async function PostLayout({
  // params,
  children,
}: PostLayoutProps) {
  // const postId = (await params)?.postId || "";
  return (
    <main className="w-full h-full flex flex-col">
      <PostTopBar />
      <section className="flex flex-row flex-1">
        {/* <div className="w-64 h-full border-r">
          <PostSidebar postId={postId} />
        </div> */}
        <article className="flex-1 overflow-auto">{children}</article>
      </section>
    </main>
  );
}
