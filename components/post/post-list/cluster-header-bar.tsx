"use client";
import { useDebounce } from "@/hooks/use-debounce";
import { usePosts } from "@/providers/posts-store-provider";
import { ClusteredPostGroup } from "@/types/graph";
import { useRef, useEffect } from "react";

type Props = {
  clusters: ClusteredPostGroup[];
  selectedClusterId?: string;
  onSelect?: (id: string) => void;
};

export function ClusterHeaderBar({ clusters }: Props) {
  const selectedClusterId = usePosts((state) => state.selectedCluster?.id);
  const setSelectedCluster = usePosts((state) => state.setSelectedCluster);
  const debouncedSelectedClusterId = useDebounce(selectedClusterId, 100);

  // 선택된 카테고리가 바뀌면 가운데로 이동
  const clusterRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  useEffect(() => {
    const el =
      debouncedSelectedClusterId &&
      clusterRefs.current[debouncedSelectedClusterId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [debouncedSelectedClusterId]);

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
              clusterRefs.current[c.id] = el;
            }}
            onClick={() => setSelectedCluster(c)}
            className={`px-2 py-1 rounded transition-all ${
              c.id === debouncedSelectedClusterId
                ? "font-bold text-primary underline"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.title} ({c.post_ids?.length})
          </button>
        ))}
      </div>
    </div>
  );
}
