import PostSidebar from "@/components/post/sidebar/post-sidebar";
import PostTopBar from "@/components/post/topBar/post-top-bar";

export default function TodoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full h-full">
      <PostTopBar />
      <section className="flex flex-row">
        <PostSidebar />
        <article>{children}</article>
      </section>
    </main>
  );
}
