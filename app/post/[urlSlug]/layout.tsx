import PostSidebar from "@/components/post/sidebar/post-sidebar";
import PostTopBar from "@/components/post/topBar/post-top-bar";

interface PostLayoutProps {
  params?: Promise<{ urlSlug: string }>;
  children: React.ReactNode;
}

export default async function PostLayout({
  params,
  children,
}: PostLayoutProps) {
  const urlSlug = (await params)?.urlSlug || "";
  return (
    <main className="w-screen h-screen flex flex-col">
      <PostTopBar />
      <section className="flex flex-row flex-1">
        <div className="w-64 h-full border-r">
          <PostSidebar urlSlug={urlSlug} />
        </div>
        <article className="flex-1 overflow-auto">{children}</article>
      </section>
    </main>
  );
}
