// "use client";
import ClusterApp from "@/components/post/cluster/cluster-app";
import { TopBar } from "@/components/post/topBar/post-top-bar";
// import { useState } from "react";

// 게시글 목록을 보는 페이지 -> 작성일 순으로
const Page: React.FC = () => {
  // const [selectedId, setSelectedId] = useState("cluster-a");

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      <TopBar />
      <aside className="absolute inset-0 w-full z-0">
        <ClusterApp />
      </aside>
      <div className="relative flex-1 flex w-1/2 min-h-0 self-end xl:mr-52">
        <div className="relative  select-none flex-1 flex py-4">
          <div className="relative z-10 flex-1 h-full overflow-y-scroll scrollbar-hidden  bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
            <ClusterHeaderBar clusters={clusters} />
            <main className="flex flex-col items-center gap-8 py-4">
              <ClusterSection clusterId="cluster-a" />
              <ClusterSection clusterId="cluster-b" />
              <ClusterSection clusterId="cluster-c" />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
const clusters = [
  { id: "cluster-a", name: "클러스터 A", count: 12 },
  { id: "cluster-b", name: "클러스터 B", count: 8 },
  { id: "cluster-c", name: "클러스터 C", count: 20 },
];

const mockPosts = [
  { id: 1, title: "포스트 A1", summary: "요약 내용입니다", quality: 0.82 },
  { id: 2, title: "포스트 A2", summary: "두번째 요약입니다", quality: 0.63 },
];

export function ClusterSection({ clusterId }: { clusterId: string }) {
  return (
    <section className="w-full max-w-3xl px-4 py-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-6">
        🔵 클러스터 {clusterId.toUpperCase()} | 전체
      </h2>

      <div className="flex flex-col gap-6">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

type Post = {
  id: number;
  title: string;
  summary: string;
  quality: number;
};

export function PostCard({ post }: { post: Post }) {
  return (
    <div className="w-full bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200">
      <div className="text-sm text-gray-400 mb-2">📎 태그들 (추후)</div>
      <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
      <p className="text-gray-700 mb-4 line-clamp-3">{post.summary}</p>
      <div className="text-sm text-gray-500">
        🗓️ 2025.03.26 &nbsp; 👀 123 &nbsp; ✨ Quality: {post.quality}
      </div>
    </div>
  );
}

type ClusterInfo = {
  id: string;
  name: string;
  count: number;
};

type Props = {
  clusters: ClusterInfo[];
  selectedClusterId?: string;
  onSelect?: (id: string) => void;
};

export function ClusterHeaderBar({
  clusters,
}: // selectedClusterId,
// onSelect,
Props) {
  const selectedClusterId = "1";
  return (
    <div className="sticky top-0 z-20 backdrop-blur-sm bg-white/60 border-b border-white/20 py-3 px-2">
      <div className="flex gap-4 overflow-x-auto whitespace-nowrap text-sm">
        {clusters.map((c) => (
          <button
            key={c.id}
            // onClick={() => onSelect(c.id)}
            className={`px-2 py-1 rounded transition-all ${
              c.id === selectedClusterId
                ? "font-bold text-primary underline"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>
    </div>
  );
}
