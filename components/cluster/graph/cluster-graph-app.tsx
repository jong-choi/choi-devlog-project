import { ClusteredPostGroup, ClusteredPostSimilarity } from "@/types/graph";
import ClusterGraphHydrator from "@/components/cluster/graph/cluster-graph-hydrator";

import "@/components/cluster/graph/cluster-graph.css";
import ClusterGraphSVG from "@/components/cluster/graph/cluster-graph-svg";

interface ClusterGraphAppProps {
  nodes: ClusteredPostGroup[];
  rawLinks: ClusteredPostSimilarity[];
}

export default function ClusterGraphApp({
  nodes,
  rawLinks,
}: ClusterGraphAppProps) {
  // D3에서 요구하는 source/target 포맷으로 변환
  const links = rawLinks.map(({ source_id, target_id, similarity }) => ({
    source: source_id || "",
    target: target_id || "",
    similarity,
  }));

  return (
    <>
      <ClusterGraphSVG nodes={nodes} links={links} />
      <ClusterGraphHydrator nodes={nodes} />
    </>
  );
}
