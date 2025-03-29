// "use client";
import {
  getClusterData,
  getClusterFeed,
  getClusterSimData,
} from "@/components/post/cluster/actions";
import ClusterGraphApp from "@/components/post/cluster/cluster-graph-app";
import ClusterPostList from "@/components/post/post-list/cluster-post-list";
import { TopBar } from "@/components/post/topBar/post-top-bar";
import { PostsProvider } from "@/providers/posts-store-provider";
// import { useState } from "react";

// 게시글 목록을 보는 페이지 -> 작성일 순으로

export default async function Page() {
  const { data: clusterData } = await getClusterData();
  const { data: clusterSimData } = await getClusterSimData();
  const postListData = await getClusterFeed();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      <TopBar />
      <PostsProvider initialState={{ selectedCluster: clusterData?.[0] }}>
        <aside className="absolute inset-0 w-full z-0">
          <ClusterGraphApp
            nodes={clusterData || []}
            rawLinks={clusterSimData || []}
          />
        </aside>
        <div className="relative flex-1 flex w-1/2 min-h-0 self-end xl:mr-52">
          <div className="w-full flex py-4">
            <div className="flex flex-col flex-1 h-full overflow-y-scroll scrollbar-hidden bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
              <ClusterPostList clusterPostList={postListData} />
            </div>
          </div>
        </div>
      </PostsProvider>
    </div>
  );
}
