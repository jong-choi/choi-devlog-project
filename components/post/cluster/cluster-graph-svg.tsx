import { ClusteredPostGroup, GraphLink } from "@/types/graph";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
  forceX,
  forceY,
} from "d3-force";
import { select } from "d3-selection";
import { JSDOM } from "jsdom";

// 내부 시뮬레이션에서 사용할 타입 정의
type SimNode = ClusteredPostGroup & SimulationNodeDatum;
type SimLink = SimulationLinkDatum<SimNode> & {
  source: string | SimNode;
  target: string | SimNode;
  similarity: number;
};

export default async function ClusterGraphSVG({
  nodes,
  links,
}: {
  nodes: ClusteredPostGroup[];
  links: GraphLink[];
}) {
  const WIDTH = 1600; // 넉넉히
  const HEIGHT = 1000;
  const simNodes: SimNode[] = structuredClone(nodes);
  const simLinks: SimLink[] = structuredClone(links);

  // directed graph의 퍼짐을 시뮬레이션 하여 각 노드의 위치를 찾아낸다.
  await new Promise<void>((resolve) => {
    forceSimulation(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", forceManyBody().strength(-50))
      .force("collide", forceCollide().radius(60))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("x", forceX(WIDTH / 2).strength(0.07))
      .force("y", forceY(HEIGHT / 2).strength(0.01))
      .on("end", resolve);
  });

  // don을 만든다.
  const dom = new JSDOM(`<html><body></body></html>`);
  const document = dom.window.document;
  const body = select(document.body);
  const svg = body
    .append("svg")
    .attr("id", "cluster-graph") // ← 여기!
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("class", "graph-svg w-full h-full"); // Tailwind에서 꽉 채움

  const g = svg.append("g");

  // 노드의 위치를 line으로 잇는다. 노드 간의 유사도에 따라 라인 디자인 변화.
  g.selectAll("line")
    .data(simLinks)
    .enter()
    .append("line")
    .attr("x1", (d) =>
      typeof d.source === "object" && d.source.x != null ? d.source.x : 0
    )
    .attr("y1", (d) =>
      typeof d.source === "object" && d.source.y != null ? d.source.y : 0
    )
    .attr("x2", (d) =>
      typeof d.target === "object" && d.target.x != null ? d.target.x : 0
    )
    .attr("y2", (d) =>
      typeof d.target === "object" && d.target.y != null ? d.target.y : 0
    )
    .attr("class", "graph-link")
    .attr("stroke-width", (d) => (d.similarity - 0.58) * 60);

  // 전체 그룹에 node들을 추가한다.
  const nodeGroups = g
    .selectAll("g.node")
    .data(simNodes)
    .enter()
    .append("g")
    .attr("class", "node");

  // 버튼 디자인
  const getFontSizeClass = (count: number) => {
    if (count >= 12) return "font-size-xl";
    if (count >= 10) return "font-size-lg";
    if (count >= 7) return "font-size-md";
    if (count >= 5) return "font-size-sm";
    return "font-size-xs";
  };

  const getQualityClass = (quality: number | null) => {
    if (quality === null) return "quality-unknown";
    if (quality <= 1) return "quality-excellent";
    if (quality <= 3) return "quality-good";
    if (quality <= 6) return "quality-average";
    if (quality <= 11) return "quality-poor";
    return "quality-bloody-awful";
  };

  nodeGroups
    .append("g")
    .attr("class", (d) => {
      const quality = getQualityClass(d.quality); // ex: "quality-good"
      const fontSize = getFontSizeClass(d.post_ids?.length ?? 0); // ex: "font-size-sm"
      return `node-button ${quality} ${fontSize}`;
    })
    .attr("data-id", (d) => d.id)
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
    .each(function (d) {
      const g = select(this);
      const count = d.post_ids?.length ?? 0;
      const title = d.title || d.id;

      g.append("rect")
        .attr("x", -80)
        .attr("y", -20)
        .attr("width", 160)
        .attr("height", 40)
        .attr("rx", 12)
        .attr("ry", 12)
        .attr("class", "graph-node");

      g.append("text")
        .attr("x", 0)
        .attr("y", 1)
        .attr("class", "graph-text graph-title")
        .call((text) => {
          text.append("tspan").text(title).attr("class", "graph-title");

          text.append("tspan").text(` (${count})`).attr("class", "graph-count");
        });
    });

  // 시뮬레이션 된 결과를 SSR
  return (
    // max-w-[800px] h-[600px]
    <div
      className="w-full h-full max-h-full min-h-0
      overflow-hidden cursor-grabbing"
      dangerouslySetInnerHTML={{ __html: body.html() }}
    />
  );
}
