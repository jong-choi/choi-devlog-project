import { ClusteredPostGroup } from "@/types/graph";
import ClusterGraphHydrator from "@/components/cluster/graph/cluster-graph-hydrator";

import "@/components/cluster/graph/cluster-graph.css";
import ClusterGraphSVG from "@/components/cluster/graph/cluster-graph-svg";

interface ClusterGraphAppProps {
  nodes: ClusteredPostGroup[];
}

export default function ClusterGraphApp({ nodes }: ClusterGraphAppProps) {
  return (
    <>
      <ClusterGraphSVG />
      <ClusterGraphHydrator nodes={nodes} />
    </>
  );
}
