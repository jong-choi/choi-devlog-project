import { ClusterSection } from "@/components/cluster/posts/cluster-section";

export default function ClusterPostList() {
  return (
    <main className="flex flex-1 overflow-auto scrollbar flex-col items-center bg-glass-bg">
      <div className="w-full flex justify-center">
        <ClusterSection />
      </div>
    </main>
  );
}
