"use client";
import { getClusterWithPostsById } from "@/app/map/actions";
import { useDebounce } from "@/hooks/use-debounce";
import { useClusterPosts } from "@/providers/cluster-posts-store-provider";
import { ClusteredPostGroup } from "@/types/graph";
import { useRef, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

type Props = {
  clusters: ClusteredPostGroup[];
  selectedClusterId?: string;
  onSelect?: (id: string) => void;
};

export function ClusterHeaderBar({ clusters }: Props) {
  const { selectedClusterId, setSelectedCluster, setClusterPostList } =
    useClusterPosts(
      useShallow((state) => ({
        selectedClusterId: state.selectedCluster?.id,
        setSelectedCluster: state.setSelectedCluster,
        setClusterPostList: state.setClusterPostList,
      }))
    );
  const debouncedSelectedClusterId = useDebounce(selectedClusterId, 100);

  // 선택된 카테고리가 바뀌면 가운데로 이동
  const clusterRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  useEffect(() => {
    if (!debouncedSelectedClusterId) return;
    const container = scrollContainerRef.current;
    const el =
      debouncedSelectedClusterId &&
      clusterRefs.current[debouncedSelectedClusterId];

    getClusterWithPostsById(debouncedSelectedClusterId).then((res) => {
      if (res?.data) {
        setClusterPostList([res.data]); // 배열 형태로 상태에 저장
      }
    });

    if (container && el) {
      const elLeft = el.offsetLeft;
      const elWidth = el.offsetWidth;
      const containerWidth = container.clientWidth;

      const scrollLeft = elLeft - containerWidth / 2 + elWidth / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [debouncedSelectedClusterId, setClusterPostList]);

  // 상하 스크롤 시 좌우 스크롤로
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      // Prevent vertical scrolling
      e.preventDefault();
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-glass-bg backdrop-blur-glass border-b border-glass-border py-3 px-2">
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex gap-4 overflow-x-auto whitespace-nowrap text-sm scrollbar-hidden"
      >
        {clusters.map((c) => (
          <button
            key={c.id}
            ref={(el) => {
              clusterRefs.current[c.id || ""] = el;
            }}
            onClick={() => setSelectedCluster(c)}
            className={`px-2 py-1 rounded transition-all ${
              c.id === debouncedSelectedClusterId
                ? "font-bold text-primary underline"
                : "hover:text-color-base"
            }`}
          >
            {c.title} ({c.post_ids?.length})
          </button>
        ))}
      </div>
    </div>
  );
}
