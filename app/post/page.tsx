import { TopBar } from "@/components/post/topBar/post-top-bar";
import { TOP_BAR_HEIGHT_REM } from "@/lib/constants/layout";
import { cn } from "@/lib/utils";

// 게시글 목록을 보는 페이지 -> 작성일 순으로
const Page: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans overflow-hidden">
      <TopBar topBarHeightRem={TOP_BAR_HEIGHT_REM} />
      <div
        className={cn("flex flex-1", `h-[calc(100vh-${TOP_BAR_HEIGHT_REM})]`)}
      >
        page
      </div>
    </div>
  );
};

export default Page;
