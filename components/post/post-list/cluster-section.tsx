import { PostCard } from "@/components/post/post-list/post-card";
import { usePosts } from "@/providers/posts-store-provider";
import { ClusterWithPosts } from "@/types/graph";
import { useRef, useEffect } from "react";

export function ClusterSection({ cluster }: { cluster: ClusterWithPosts }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const setManualSelectedCluster = usePosts((s) => s.setManualSelectedCluster);
  const selectedClusterId = usePosts((s) => s.selectedCluster?.id);
  const isManualScrolling = usePosts((state) => state.isManualScrolling);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!isManualScrolling) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && selectedClusterId !== cluster.id) {
          setManualSelectedCluster(cluster);
        }
      },
      {
        rootMargin: "-0% 0px -0% 0px",
        threshold: 0.05,
      }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [cluster, isManualScrolling, selectedClusterId, setManualSelectedCluster]);

  return (
    <section
      ref={ref}
      className="w-full max-w-3xl px-4 bg-glass-bg backdrop-blur-sm pb-4"
    >
      <div className="flex flex-col gap-1 py-4 px-4">
        <h2 className="text-xl font-bold text-shadow">{cluster.title}</h2>
        <span className="text-sm text-shadow">
          {cluster.summary?.replaceAll("이 군집은", "").trim()}
        </span>
      </div>
      <div className="flex flex-col gap-6">
        {cluster.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
