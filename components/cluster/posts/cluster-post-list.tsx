"use client";

import { useEffect, useRef } from "react";
import { useClusterPosts } from "@/providers/cluster-posts-store-provider";
import { ClusterSection } from "@/components/cluster/posts/cluster-section";
import { getClusterWithPostsById } from "@/app/map/fetchers";
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
  const isWaitingRef = useRef(false);
  const hasMountedRef = useRef(false);

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 100,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (mainRef.current && !hasMountedRef.current) {
      mainRef.current.scrollTo({
        top: 100,
        behavior: "smooth",
      });
      setTimeout(() => {
        hasMountedRef.current = true;
      }, 500);
    }

    if (!selectedCluster) return;

    const currentIndex = clusters.findIndex((c) => c.id === selectedCluster.id);

    const handleClusterChange = (nextIndex: number) => {
      if (nextIndex < 0) nextIndex = clusters.length - 1;
      if (nextIndex >= clusters.length) nextIndex = 0;

      const next = clusters[nextIndex];
      if (!next?.id || next.id === selectedCluster.id) return;

      isWaitingRef.current = true;

      setSelectedCluster(next);
      getClusterWithPostsById(next.id!).then((res) => {
        if (res?.data) {
          setClusterWithPost(res.data);
          setTimeout(scrollToTop, 50);
        }
      });

      setTimeout(() => {
        isWaitingRef.current = false;
      }, 500);
    };

    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        if (
          !hasMountedRef.current ||
          !entry.isIntersecting ||
          isWaitingRef.current
        )
          return;

        handleClusterChange(currentIndex + 1);
      },
      { threshold: 0.3 }
    );

    const topObserver = new IntersectionObserver(
      ([entry]) => {
        if (
          !hasMountedRef.current ||
          !entry.isIntersecting ||
          isWaitingRef.current
        )
          return;

        handleClusterChange(currentIndex - 1);
      },
      { threshold: 0.3 }
    );

    if (sentinelRef.current) bottomObserver.observe(sentinelRef.current);
    if (sentinelTopRef.current) topObserver.observe(sentinelTopRef.current);

    return () => {
      bottomObserver.disconnect();
      topObserver.disconnect();
    };
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
