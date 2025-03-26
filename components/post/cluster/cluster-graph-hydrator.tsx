"use client";

import { useEffect, useRef, useState } from "react";
import { select, zoom, ZoomBehavior, zoomIdentity } from "d3";
import "@/components/post/cluster/cluster-graph.css";

type ClusteredPostGroup = {
  id: string;
  title: string | null;
  quality: number | null;
  post_ids: string[] | null;
};

type Props = {
  nodes: ClusteredPostGroup[];
};

export default function ClusterGraphHydrator({ nodes }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    () => nodes[0].id
  );
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    const svgEl = document.querySelector("svg");
    if (!svgEl) return;

    const svg = select<SVGSVGElement, unknown>(svgEl);
    const g = svg.select("g");

    // 줌 기능
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1.2, 3])
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
    const buttons = svgEl.querySelectorAll("button.graph-button");

    buttons.forEach((button) => {
      const id = button.getAttribute("data-id");
      if (!id) return;

      const matchedNode = nodes.find((n) => n.id === id);
      if (!matchedNode) return;

      button.addEventListener("click", () => {
        setSelectedId(id);
        console.log(
          "📦 post_ids for",
          matchedNode.id,
          ":",
          matchedNode.post_ids
        );
      });
    });

    return () => {
      buttons.forEach((button) => {
        button.replaceWith(button.cloneNode(true));
      });
    };
  }, [nodes]);

  // 선택된 노드가 변경될 때 발생될 이벤트
  useEffect(() => {
    if (!selectedId || !zoomRef.current) return;

    const svgEl = document.querySelector("svg");
    if (!svgEl) return;

    const svg = select<SVGSVGElement, unknown>(svgEl);

    const allButtons = svgEl.querySelectorAll("button.graph-button");
    allButtons.forEach((btn) => btn.classList.remove("selected"));

    const button = Array.from(allButtons).find(
      (btn) => btn.getAttribute("data-id") === selectedId
    );

    if (!button) return;

    button.classList.add("selected");
    const foreignObject = button.closest("foreignObject");
    if (!foreignObject) return;

    const x =
      parseFloat(foreignObject.getAttribute("x") || "0") +
      parseFloat(foreignObject.getAttribute("width") || "0") / 2;
    const y =
      parseFloat(foreignObject.getAttribute("y") || "0") +
      parseFloat(foreignObject.getAttribute("height") || "0") / 2;

    const offsetX = window.innerWidth / 2 - 500; // 가운데 기준에서 왼쪽으로 150px
    const offsetY = window.innerHeight / 2;
    const scale = 3;

    svg
      .transition()
      .duration(500)
      .call(
        zoomRef.current.transform,
        zoomIdentity
          .translate(offsetX - x * scale, offsetY - y * scale)
          .scale(scale)
      );
  }, [selectedId]);

  return null;
}
