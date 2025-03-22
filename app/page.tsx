import { TopBar } from "@/components/post/topBar/post-top-bar";

export default function Page() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans overflow-hidden">
      <TopBar />
      <div className="flex flex-1">page</div>
    </div>
  );
}
