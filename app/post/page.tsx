import { TopBar } from "@/components/post/topBar/post-top-bar";

// 게시글 목록을 보는 페이지 -> 작성일 순으로
const Page: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans overflow-hidden">
      <TopBar />
      <div className="flex flex-1">page</div>
    </div>
  );
};

export default Page;
