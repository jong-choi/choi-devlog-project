// import {
//   getClusterData,
//   getClusterSimData,
//   getClusterWithPostsById,
// } from "@/app/map/fetchers";
import ClusterGraphApp from "@/components/cluster/graph/cluster-graph-app";
import { ClusterHeaderBar } from "@/components/cluster/posts/cluster-header-bar";
import ClusterPostList from "@/components/cluster/posts/cluster-post-list";

import { TopBar } from "@/components/ui/post-top-bar";
import { ClusterPostsProvider } from "@/providers/cluster-posts-store-provider";

export default async function Page() {
  // const { data: clusterData } = await getClusterData();
  // const { data: clusterSimData } = await getClusterSimData();
  // const { data: postListData } = await getClusterWithPostsById(
  //   (clusterData && clusterData[0].id) || ""
  // );
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { data: clusterData } = await fetch(
    `${BASE_URL}/api/(fetchers)/map/clusters`,
    {
      next: { revalidate: 36000 },
    }
  ).then((res) => res.json());

  const { data: clusterSimData } = await fetch(
    `${BASE_URL}/api/(fetchers)/map/similarities?threshold=0.6`,
    {
      next: { revalidate: 36000 },
    }
  ).then((res) => res.json());

  const { data: postListData } = await fetch(
    `${BASE_URL}/api/(fetchers)/map/clusters/${clusterData?.[0]?.id ?? ""}`,
    {
      next: { revalidate: 36000 },
    }
  ).then((res) => res.json());

  return (
    <div className="h-screen flex flex-col bg-background text-color-base font-sans">
      <TopBar />
      <ClusterPostsProvider
        initialState={{
          selectedCluster: clusterData?.[0],
          clusterWithPosts: postListData,
        }}
      >
        <aside className="absolute inset-0 w-full z-0">
          <ClusterGraphApp
            nodes={clusterData || []}
            rawLinks={clusterSimData || []}
          />
        </aside>
        <div className="relative flex-1 flex w-full pt-[40vh] md:pt-0 md:w-1/2  min-h-0 self-end xl:mr-52">
          <div className="w-full flex py-4">
            <div className="flex flex-col flex-1 h-full overflow-y-scroll scrollbar-hidden bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
              <ClusterHeaderBar clusters={clusterData || []} />
              <ClusterPostList />
            </div>
          </div>
        </div>
      </ClusterPostsProvider>
    </div>
  );
}
