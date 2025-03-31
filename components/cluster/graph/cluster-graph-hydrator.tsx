"use client";

import { useEffect, useRef } from "react";
import { select, zoom, ZoomBehavior, zoomIdentity } from "d3";
import "@/components/cluster/graph/cluster-graph.css";
import { ClusteredPostGroup } from "@/types/graph";
import { usePosts } from "@/providers/posts-store-provider";
import { useDebounce } from "@/hooks/use-debounce";

type Props = {
  nodes: ClusteredPostGroup[];
};

export default function ClusterGraphHydrator({ nodes }: Props) {
  const selectedId = usePosts((state) => state.selectedCluster?.id);
  const setSelectedCluster = usePosts((state) => state.setSelectedCluster);

  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    const svgEl = document.querySelector("#cluster-graph") as SVGSVGElement;
    if (!svgEl) return;

    const svg = select<SVGSVGElement, unknown>(svgEl);
    const g = svg.select("g");

    // 줌 기능
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1.2, 5])
      .translateExtent([
        [0, 0],
        [2000, 2000],
      ])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    svg
      .transition()
      .duration(500)
      .call(zoomBehavior.transform, zoomIdentity.translate(100, 0).scale(1.2));

    // 각 노드에 이벤트 달아주기
    const groups = svgEl.querySelectorAll("g.node-button");

    groups.forEach((group) => {
      const id = group.getAttribute("data-id");
      if (!id) return;

      const matchedNode = nodes.find((n) => n.id === id);
      if (!matchedNode) return;

      group.addEventListener("click", () => {
        setSelectedCluster(matchedNode);
      });
    });

    return () => {
      groups.forEach((group) => {
        group.replaceWith(group.cloneNode(true));
      });
    };
  }, [nodes, setSelectedCluster]);

  const debouncedSelectedClusterId = useDebounce(selectedId, 100);
  // 선택된 노드가 변경될 때 발생될 이벤트
  useEffect(() => {
    if (!debouncedSelectedClusterId || !zoomRef.current) return;

    const svgEl = document.querySelector("#cluster-graph") as SVGSVGElement;
    if (!svgEl) return;

    const svg = select<SVGSVGElement, unknown>(svgEl);

    const allGroups = svgEl.querySelectorAll("g.node-button");
    allGroups.forEach((g) => g.classList.remove("selected"));

    const group = Array.from(allGroups).find(
      (g) => g.getAttribute("data-id") === debouncedSelectedClusterId
    );
    if (!group) return;

    group.classList.add("selected");

    // 1. getBBox로 내부 상대 좌표
    const bbox = (group as SVGGElement).getBBox();

    // 2. transform 속성에서 x, y 추출
    const transform = group.getAttribute("transform"); // 예: "translate(345.23, 211.94)"
    const match = transform?.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;

    // 3. 중심점 계산 (transform + bbox 중심)
    const cx = tx + bbox.x + bbox.width / 2;
    const cy = ty + bbox.y + bbox.height / 2;

    const isMobile = window.innerWidth < 1024;
    const offsetX = isMobile
      ? window.innerWidth * 2
      : window.innerWidth / 2 - window.innerWidth / 3;
    const offsetY = isMobile ? -window.innerHeight / 4 : window.innerHeight / 2;
    const scale = 5;

    svg
      .transition()
      .duration(500)
      .call(
        zoomRef.current.transform,
        zoomIdentity
          .translate(offsetX - cx * scale, offsetY - cy * scale)
          .scale(scale)
      );
  }, [debouncedSelectedClusterId]);

  return null;
}
