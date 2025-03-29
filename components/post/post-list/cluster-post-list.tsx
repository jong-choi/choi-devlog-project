"use client";
import { ClusterHeaderBar } from "@/components/post/post-list/cluster-header-bar";
import { ClusterSection } from "@/components/post/post-list/cluster-section";
import { usePosts } from "@/providers/posts-store-provider";

import { ClusterWithPosts } from "@/types/graph";

import { useRef, useEffect } from "react";

export default function ClusterPostList({
  clusterPostList,
}: {
  clusterPostList: ClusterWithPosts[];
}) {
  const selectedClusterId = usePosts((state) => state.selectedCluster?.id);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isManualScrolling = usePosts((state) => state.isManualScrolling);
  const setManualScrolling = usePosts((state) => state.setManualScrolling);

  useEffect(() => {
    if (isManualScrolling) return;
    if (selectedClusterId && sectionRefs.current[selectedClusterId]) {
      sectionRefs.current[selectedClusterId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setTimeout(() => setManualScrolling(true), 600);
    }
  }, [isManualScrolling, selectedClusterId, setManualScrolling]);

  return (
    <>
      <ClusterHeaderBar clusters={clusterPostList} />
      <main className="flex flex-1 overflow-auto scrollbar flex-col items-center gap-8">
        {clusterPostList.map((cluster) => (
          <div
            key={cluster.id}
            ref={(el) => {
              sectionRefs.current[cluster.id] = el;
            }}
            className="w-full flex justify-center"
          >
            <ClusterSection cluster={cluster} />
          </div>
        ))}
      </main>
    </>
  );
}
