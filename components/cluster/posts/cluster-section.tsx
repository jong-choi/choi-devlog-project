"use client";

import { useShallow } from "zustand/react/shallow";
import { Spinner } from "@ui/spinner";
import { PostCard } from "@/components/posts/post-card";
import { useClusterPosts } from "@/providers/cluster-posts-store-provider";
import { GraphPost, PostTags } from "@/types/graph";

export function ClusterSection() {
  const { clusterWithPosts } = useClusterPosts(
    useShallow((state) => ({
      clusterWithPosts: state.clusterWithPosts,
    })),
  );

  if (!clusterWithPosts) {
    return (
      <section className="w-full max-w-3xl px-4 bg-glass-bg backdrop-blur-sm pb-4 min-h-[40vh] flex items-center justify-center">
        <div className="text-muted-foreground">
          <Spinner size="lg" />
        </div>
      </section>
    );
  }
  const posts = clusterWithPosts.posts as (GraphPost & {
    tags: PostTags[];
  })[];

  return (
    <section className="w-full max-w-3xl px-4 bg-glass-bg min-h-[30rem] backdrop-blur-sm pb-4">
      <div className="flex flex-col gap-1 py-4 px-4">
        <h2 className="text-xl font-bold text-shadow">
          {clusterWithPosts.title}
        </h2>
        <span className="text-sm text-shadow">
          {clusterWithPosts.summary?.replaceAll("이 군집은", "").trim()}
        </span>
      </div>
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
