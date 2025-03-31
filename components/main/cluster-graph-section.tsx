import {
  getClusterData,
  getClusterSimData,
  getClusterWithPosts,
} from "@/app/map/actions";
import ClusterGraphApp from "@/components/cluster/graph/cluster-graph-app";
import ClusterPostList from "@/components/cluster/posts/cluster-post-list";
import { PostsProvider } from "@/providers/posts-store-provider";

export default async function ClusterGraphSection({
  isMain = false,
}: {
  isMain?: boolean;
}) {
  const { data: clusterData } = await getClusterData();
  const { data: clusterSimData } = await getClusterSimData();
  const { data: postListData } = await getClusterWithPosts();
  return (
    <PostsProvider initialState={{ selectedCluster: clusterData?.[0], isMain }}>
      <aside className="absolute inset-0 w-full z-0">
        <ClusterGraphApp
          nodes={clusterData || []}
          rawLinks={clusterSimData || []}
        />
      </aside>
      <div className="relative flex-1 flex w-full pt-40 md:pt-0 md:w-1/2 min-h-0 self-end">
        <div className="w-full flex md:py-4 ">
          <div className="flex flex-col flex-1 h-full overflow-y-scroll scrollbar-hidden bg-glass-bg shadow-lg">
            <ClusterPostList clusterPostList={postListData || []} />
          </div>
        </div>
      </div>
    </PostsProvider>
  );
}
