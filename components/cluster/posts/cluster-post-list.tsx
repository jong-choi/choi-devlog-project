"use client";
import { useEffect, useRef } from "react";
import { useClusterPosts } from "@/providers/cluster-posts-store-provider";
import { ClusterSection } from "@/components/cluster/posts/cluster-section";
import { getClusterWithPostsById } from "@/app/map/actions";
import { useShallow } from "zustand/react/shallow";

export default function ClusterPostList() {
  const { clusters, selectedCluster, setSelectedCluster, setClusterWithPost } =
    useClusterPosts(
      useShallow((state) => ({
        clusters: state.clusters,
        selectedCluster: state.selectedCluster,
        setSelectedCluster: state.setSelectedCluster,
        setClusterWithPost: state.setClusterWithPost,
      }))
    );

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sentinelTopRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const directionRef = useRef<"up" | "down">("down");
  const prevY = useRef<number>(0);
  const isWaitingRef = useRef(false);

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 100,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const y = entry.boundingClientRect.y;
          const direction = y < prevY.current ? "down" : "up";
          directionRef.current = direction;
          prevY.current = y;

          if (
            entry.isIntersecting &&
            selectedCluster &&
            !isWaitingRef.current
          ) {
            const currentIndex = clusters.findIndex(
              (c) => c.id === selectedCluster.id
            );

            let nextIndex =
              direction === "down" ? currentIndex + 1 : currentIndex - 1;

            if (nextIndex >= clusters.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = clusters.length - 1;

            const next = clusters[nextIndex];

            if (next.id !== selectedCluster.id) {
              isWaitingRef.current = true;

              setSelectedCluster(next);
              getClusterWithPostsById(next.id!).then((res) => {
                if (res?.data) {
                  setClusterWithPost(res.data);

                  setTimeout(() => {
                    scrollToTop();
                  }, 50);
                }
              });

              setTimeout(() => {
                isWaitingRef.current = false;
              }, 500);
            }
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    if (sentinelTopRef.current) observer.observe(sentinelTopRef.current);

    return () => observer.disconnect();
  }, [selectedCluster, clusters, setSelectedCluster, setClusterWithPost]);

  return (
    <main
      ref={mainRef}
      className="flex flex-1 overflow-auto scrollbar flex-col items-center bg-glass-bg"
    >
      <div
        ref={sentinelTopRef}
        className="w-full h-32 opacity-0 pointer-events-none"
      />
      <div className="w-full flex justify-center py-[100px]">
        <ClusterSection />
      </div>
      <div
        ref={sentinelRef}
        className="w-full h-32 opacity-0 pointer-events-none"
      />
    </main>
  );
}
