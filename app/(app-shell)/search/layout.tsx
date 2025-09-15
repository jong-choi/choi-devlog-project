import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { PageContainer } from "@ui/glass-container";
import { LinkLoader } from "@ui/route-loader";
import SearchInput from "@/components/posts/infinite-scroll/search-input";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <PageContainer>
      <Suspense>
        <SearchInput />
      </Suspense>
      <LinkLoader
        className="text-sm text-color-muted hover:text-color-base flex items-center"
        href="/post"
      >
        <ChevronLeft className="w-4 h-4" /> 전체 게시글 보기
      </LinkLoader>
      {children}
    </PageContainer>
  );
}
