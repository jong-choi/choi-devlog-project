"use client";
import { ClusterSection } from "@/components/cluster/posts/cluster-section";
import { useClusterPosts } from "@/providers/cluster-posts-store-provider";
import { useRef, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export default function ClusterPostList() {
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const mainRef = useRef<HTMLElement | null>(null);

  const {
    selectedClusterId,
    isMain,
    isManualScrolling,
    setManualScrolling,
    clusterPostList,
  } = useClusterPosts(
    useShallow((state) => ({
      clusterPostList: state.clusterPostList,
      selectedClusterId: state.selectedCluster?.id,
      isMain: state.isMain,
      isManualScrolling: state.isManualScrolling,
      setManualScrolling: state.setManualScrolling,
    }))
  );

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
      <main
        ref={mainRef}
        className="flex flex-1 overflow-auto scrollbar flex-col items-center bg-glass-bg"
      >
        {clusterPostList
          .filter((cluster) => {
            if (!isMain) return true;
            return cluster.id === selectedClusterId;
          })
          .map((cluster) => (
            <div
              key={cluster.id}
              ref={(el) => {
                sectionRefs.current[cluster.id || ""] = el;
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
