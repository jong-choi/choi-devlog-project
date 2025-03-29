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

  const mainRef = useRef<HTMLElement | null>(null); // 👈 main 요소를 감지할 ref

  useEffect(() => {
    if (isManualScrolling) return;

    const container = mainRef.current;
    const target = selectedClusterId
      ? sectionRefs.current[selectedClusterId]
      : null;

    if (container && target) {
      // offsetTop은 부모 기준으로 상대 위치임
      const scrollTop = target.offsetTop - container.offsetTop; // 보정해도 되고 안 해도 되고

      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });

      setTimeout(() => setManualScrolling(true), 600);
    }
  }, [isManualScrolling, selectedClusterId, setManualScrolling]);
  return (
    <>
      <ClusterHeaderBar clusters={clusterPostList} />
      <main
        ref={mainRef} // 👈 여기다 ref 추가!
        className="flex flex-1 overflow-auto scrollbar flex-col items-center gap-8"
      >
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
