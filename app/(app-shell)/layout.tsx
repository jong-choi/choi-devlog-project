import { TopBar } from "@/components/post/topBar/post-top-bar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col text-color-base font-sans">
      <TopBar />
      <div className="flex flex-1 flex-col overflow-auto">
        {/* 메인 섹션 */}
        <main className="w-full lg:max-w-screen-xl mx-auto flex flex-col gap-8 py-4 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
