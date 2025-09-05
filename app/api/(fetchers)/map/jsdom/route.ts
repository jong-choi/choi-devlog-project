import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  SimulationLinkDatum,
  SimulationNodeDatum,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { select } from "d3-selection";
import { JSDOM } from "jsdom";
import { getClusterData, getClusterSimData } from "@/app/map/fetchers";
import { ClusteredPostGroup } from "@/types/graph";

// 내부 시뮬레이션용 타입
type SimNode = ClusteredPostGroup & SimulationNodeDatum;
type SimLink = SimulationLinkDatum<SimNode> & {
  source: string | SimNode;
  target: string | SimNode;
  similarity: number;
};

export async function GET() {
  const { data: nodes } = await getClusterData();
  const { data: rawLinks } = await getClusterSimData();
  if (!nodes) {
    return NextResponse.json(
      { error: "Missing data : JSDOM Nodes" },
      { status: 400 },
    );
  }
  if (!rawLinks) {
    return NextResponse.json(
      { error: "Missing data : JSDOM RawLinks" },
      { status: 400 },
    );
  }

  const links = rawLinks.map(({ source_id, target_id, similarity }) => ({
    source: source_id || "",
    target: target_id || "",
    similarity,
  }));

  const WIDTH = 1600;
  const HEIGHT = 1000;

  const simNodes: SimNode[] = structuredClone(nodes);
  const simLinks: SimLink[] = structuredClone(links);

  await new Promise<void>((resolve) => {
    forceSimulation(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id!)
          .distance(100),
      )
      .force("charge", forceManyBody().strength(-50))
      .force("collide", forceCollide().radius(60))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("x", forceX(WIDTH / 2).strength(0.07))
      .force("y", forceY(HEIGHT / 2).strength(0.01))
      .on("end", resolve);
  });

  const dom = new JSDOM(`<html><body></body></html>`);
  const document = dom.window.document;
  const body = select(document.body);

  const svg = body
    .append("svg")
    .attr("id", "cluster-graph")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("class", "graph-svg w-full h-full");

  const g = svg.append("g");

  g.selectAll("line")
    .data(simLinks)
    .enter()
    .append("line")
    .attr("x1", (d) => (typeof d.source === "object" ? (d.source.x ?? 0) : 0))
    .attr("y1", (d) => (typeof d.source === "object" ? (d.source.y ?? 0) : 0))
    .attr("x2", (d) => (typeof d.target === "object" ? (d.target.x ?? 0) : 0))
    .attr("y2", (d) => (typeof d.target === "object" ? (d.target.y ?? 0) : 0))
    .attr("class", "graph-link")
    .attr("stroke-width", (d) => (d.similarity - 0.58) * 60);

  const nodeGroups = g
    .selectAll("g.node")
    .data(simNodes)
    .enter()
    .append("g")
    .attr("class", "node");

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
      const quality = getQualityClass(d.quality);
      const fontSize = getFontSizeClass(d.post_ids?.length ?? 0);
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
        .attr("class", "graph-node");

      g.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "graph-text graph-title")
        .call((text) => {
          text.append("tspan").text(title).attr("class", "graph-title");
          text.append("tspan").text(` (${count})`).attr("class", "graph-count");
        });
    });

  return NextResponse.json({ html: body.html() });
}

export async function POST() {
  // 강제로 지도 다시 만들도록 임시 구현
  revalidatePath("/api/map/jsdom");
  revalidatePath("/map");
  revalidatePath("/");
  return Response.json({ revalidated: true, now: Date.now() });
}
