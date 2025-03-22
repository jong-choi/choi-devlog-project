// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function BlogLayout() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans transition-colors duration-500 overflow-hidden">
      <TopBar
        {...{
          leftOpen,
          setLeftOpen,
          rightOpen,
          setRightOpen,
        }}
      />
      <div className="flex flex-1 pt-14 h-[calc(100vh-56px)]">
        <LeftSidebar leftOpen={leftOpen} setLeftOpen={setLeftOpen} />
        <MainContent />
        <RightSidebar rightOpen={rightOpen} setRightOpen={setRightOpen} />
      </div>
    </div>
  );
}

function TopBar({ leftOpen, setLeftOpen, rightOpen, setRightOpen }) {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/90 dark:bg-[#1f1f1f]/90 backdrop-blur border-b border-border h-14 z-10 flex items-center px-6 justify-between">
      <Logo />
      <div className="flex gap-2 items-center">
        <ToggleButton
          open={leftOpen}
          onClick={() => setLeftOpen(!leftOpen)}
          label="카테고리"
        />
        <ToggleButton
          open={rightOpen}
          onClick={() => setRightOpen(!rightOpen)}
          label="탐색"
        />
      </div>
    </nav>
  );
}

function Logo() {
  return (
    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
      scribbly<span className="text-indigo-500">.</span>
    </h1>
  );
}

function ToggleButton({ open, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-100 px-3 py-1 rounded text-sm"
    >
      {open ? `${label} 숨기기` : `${label} 보이기`}
    </button>
  );
}

function LeftSidebar({ leftOpen, setLeftOpen }) {
  return (
    <aside
      className={cn(
        "transition-all duration-300 h-full hidden lg:flex flex-col bg-white dark:bg-[#1b1b1b] border-r border-border shadow-sm",
        leftOpen ? "w-64" : "w-10"
      )}
    >
      {leftOpen ? (
        <SidebarSection
          title="Topics"
          items={[
            "✨ Trending",
            "📘 Web Dev",
            "🧠 AI & ML",
            "⚡ Productivity",
            "🔧 Tools",
          ]}
        />
      ) : (
        <SidebarToggle onClick={() => setLeftOpen(true)} />
      )}
    </aside>
  );
}

function RightSidebar({ rightOpen, setRightOpen }) {
  return (
    <aside
      className={cn(
        "transition-all duration-300 h-full hidden lg:flex flex-col bg-white dark:bg-[#1b1b1b] border-l border-border shadow-sm",
        rightOpen ? "w-64" : "w-10"
      )}
    >
      {!rightOpen && (
        <SidebarToggle onClick={() => setRightOpen(true)} reverse />
      )}
      {rightOpen && <SidebarContent />}
    </aside>
  );
}

function SidebarToggle({ onClick, reverse = false }) {
  return (
    <div className="h-10 flex items-center justify-center">
      <button
        onClick={onClick}
        className="text-xs bg-gray-200 dark:bg-neutral-700 px-2 py-1 rounded"
      >
        {reverse ? "<" : ">"}
      </button>
    </div>
  );
}

function SidebarSection({ title, items }) {
  return (
    <div className="p-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <h2 className="text-gray-900 dark:text-white font-semibold">{title}</h2>
      {items.map((item) => (
        <button
          key={item}
          className="block w-full text-left hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function SidebarContent() {
  const recent = [
    "Next.js로 블로그 만들기",
    "Zustand 상태관리 실전",
    "Supabase와 이미지 업로드",
  ];
  const tags = ["#Next.js", "#React", "#AI", "#Zustand"];
  return (
    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-6">
      <SidebarBlock title="⏱️ 최근 글">
        <ul className="space-y-1">
          {recent.map((item) => (
            <li key={item}>
              <a
                href="#"
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </SidebarBlock>
      <SidebarBlock title="🔥 인기 태그">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 px-2 py-1 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </SidebarBlock>
    </div>
  );
}

function SidebarBlock({ title, children }) {
  return (
    <div>
      <h3 className="text-gray-800 dark:text-white font-semibold mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

// --bgColor-default: #0d1117;
// --bgColor-muted: #151b23;
// --bgColor-neutral-muted: #656c7633;
import TitleEditor from "@/components/post/main/title-editor";
import MarkdownEditor from "@/components/markdown/markdown-editor";
import { AutosaveProvider } from "@/providers/autosave-store-provider";
export function MainContent() {
  return (
    <main className="flex flex-1 flex-col h-full bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white">
      <MainHeader />
      <ContinueReadingBanner />
      <ContentContainer>
        <AutosaveProvider>
          <TitleEditor defaultValue={"안녕이란 말 헬로헬로" || ""} />
          <MarkdownEditor markdown={"이젠 굿바이 굿바이" || ""} />
        </AutosaveProvider>
        <FeaturedPost />
        <ArticleList />
      </ContentContainer>
    </main>
  );
}

function MainHeader() {
  return (
    <header className="h-[48px] border-b border-border flex items-center px-6 bg-gradient-to-r from-indigo-50 to-white dark:from-[#1b1b1b] dark:to-[#121212] text-sm text-gray-600 dark:text-gray-400">
      매일 한 걸음씩 성장하는 개발자의 흔적 🪶
    </header>
  );
}

function ContinueReadingBanner() {
  return (
    <div className="bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-100 text-sm px-6 py-3 border-b border-border flex justify-between items-center">
      <span>
        📌 마지막으로 읽던 글: <strong>“Zustand로 상태 관리하기”</strong>
      </span>
      <button className="text-indigo-600 dark:text-indigo-300 hover:underline flex items-center gap-1 text-sm">
        이어서 읽기 <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ContentContainer({ children }: React.PropsWithChildren) {
  return (
    <section className="flex-1 flex justify-center overflow-y-auto px-12 py-16 bg-background">
      <div className="w-full max-w-5xl space-y-16">{children}</div>
    </section>
  );
}

function FeaturedPost() {
  return (
    <div className="relative rounded-3xl overflow-hidden h-64 shadow-xl group">
      <img
        src="/hero.jpg"
        alt="featured post"
        className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:brightness-75 transition duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <div className="relative z-10 p-6 h-full flex flex-col justify-end">
        <h2 className="text-white text-2xl font-bold">
          📣 Next.js 15의 진짜 파워를 파헤치다
        </h2>
        <p className="text-indigo-100 text-sm mt-2">
          App Router, RSC, 캐싱 전략까지. 지금 바로 알아보세요.
        </p>
      </div>
    </div>
  );
}

function ArticleList() {
  const posts = [
    {
      id: 1,
      title: "Zustand로 상태 관리를 예술처럼",
      desc: "Redux? Context? 이제는 Zustand의 시대입니다. 전역 상태의 간결함을 경험하세요.",
    },
    {
      id: 2,
      title: "App Router에서 캐싱 전략 완전 정복",
      desc: "Next.js 15에서 새롭게 바뀐 캐싱 메커니즘, 언제 revalidate 되고, 언제 캐싱되는가?",
    },
    {
      id: 3,
      title: "ShadCN UI로 디자인 시스템 구축하기",
      desc: "디자인 일관성과 개발 생산성을 함께 챙기는 방법, ShadCN 컴포넌트 모듈화 전략을 소개합니다.",
    },
    {
      id: 4,
      title: "AI로 요약된 포스트 보기",
      desc: "GPT를 활용해 블로그 글 요약 자동화하기 — Supabase와 통합하여 실시간 저장까지.",
    },
    {
      id: 5,
      title: "구독 기반 블로그 만들기",
      desc: "Next.js + Stripe로 간단한 유료 구독 블로그 구축하기. 보호된 글과 회원 기능까지 한 번에!",
    },
  ];

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <ArticleCard key={post.id} {...post} />
      ))}
    </div>
  );
}

function ArticleCard({ title, desc }) {
  return (
    <article className="rounded-3xl bg-white/70 dark:bg-white/10 backdrop-blur-md shadow-xl border border-gray-200 dark:border-neutral-700 hover:shadow-2xl transition p-6">
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200 px-2 py-0.5 rounded-full">
          Zustand
        </span>
        <span>2024.03.21</span>
        <span>6 min read</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
        {title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
        {desc}
      </p>
      <div className="mt-4 text-indigo-600 dark:text-indigo-300 text-sm font-medium hover:underline cursor-pointer">
        자세히 보기 →
      </div>
    </article>
  );
}
