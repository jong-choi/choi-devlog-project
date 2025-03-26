import { ClusteredPostGroup, ClusteredPostSimilarity } from "@/types/graph";
import ClusterGraphSVG from "@/components/post/cluster/cluster-graph-svg";
import ClusterGraphHydrator from "@/components/post/cluster/cluster-graph-hydrator";

import "@/components/post/cluster/cluster-graph.css";
import {
  getClusterData,
  getClusterSimData,
} from "@/components/post/cluster/actions";

export default async function ClusterApp() {
  const { data: ClusterData } = await getClusterData();
  const { data: ClusterSimData } = await getClusterSimData();

  const nodes: ClusteredPostGroup[] = ClusterData || [];
  const rawLinks: ClusteredPostSimilarity[] = ClusterSimData || [];

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
