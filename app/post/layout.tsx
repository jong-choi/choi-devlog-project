import PostSidebar from "@/components/post/sidebar/post-sidebar";
import PostTopBar from "@/components/post/topBar/post-top-bar";
import { Suspense } from "react";

export default function TodoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full h-full flex flex-col">
      <PostTopBar />
      <section className="flex flex-row flex-1">
        <div className="w-64 h-full border-r">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full w-full">
                <div className="spinner"></div>
              </div>
            }
          >
            <PostSidebar />
          </Suspense>
        </div>
        <article className="flex-1 overflow-auto">{children}</article>{" "}
      </section>
    </main>
  );
}
