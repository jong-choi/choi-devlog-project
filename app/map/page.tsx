import {
  getClusterWithPosts,
  getClusterData,
  getClusterSimData,
} from "@/app/map/actions";
import ClusterGraphApp from "@/components/cluster/graph/cluster-graph-app";
import ClusterPostList from "@/components/cluster/posts/cluster-post-list";
import { TopBar } from "@/components/ui/post-top-bar";
import { PostsProvider } from "@/providers/posts-store-provider";

export default async function Page() {
  const { data: clusterData } = await getClusterData();
  const { data: clusterSimData } = await getClusterSimData();
  const { data: postListData } = await getClusterWithPosts();

  return (
    <div className="h-screen flex flex-col bg-background text-color-base font-sans">
      <TopBar />
      <PostsProvider initialState={{ selectedCluster: clusterData?.[0] }}>
        <aside className="absolute inset-0 w-full z-0">
          <ClusterGraphApp
            nodes={clusterData || []}
            rawLinks={clusterSimData || []}
          />
        </aside>
        <div className="relative flex-1 flex w-full pt-[40vh] md:pt-0 md:w-1/2  min-h-0 self-end xl:mr-52">
          <div className="w-full flex py-4">
            <div className="flex flex-col flex-1 h-full overflow-y-scroll scrollbar-hidden bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
              <ClusterPostList clusterPostList={postListData || []} />
            </div>
          </div>
        </div>
      </PostsProvider>
    </div>
  );
}
