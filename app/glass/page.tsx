// app/glass/page.tsx

import { GlassButton } from "@ui/glass-button";

export default function GlassPage() {
  return (
    <div className="min-h-screen bg-color-bg text-color-base p-10 flex flex-col gap-8 items-center justify-center">
      <h1 className="text-3xl font-bold">Glassmorphism + Theme Tokens</h1>

      {/* 텍스트 토큰 예시 */}
      <div className="bg-color-bg border border-color-border rounded-xl p-6 shadow-md max-w-md w-full">
        <p className="text-color-base text-lg font-semibold">기본 텍스트</p>
        <p className="text-color-muted text-sm mt-1">보조 설명 텍스트</p>
        <button className="mt-4 px-4 py-2 rounded-lg bg-color-selected-bg text-color-selected-text hover:bg-color-hover transition">
          선택된 버튼
        </button>
      </div>

      {/* 기본 Glass 카드 */}
      <div className="bg-glass-bg border border-glass-border shadow-glass backdrop-blur-glass rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold">나는 기본 글라스모픽 카드</h2>
        <p className="text-sm text-color-muted mt-2">
          반투명 배경 + blur + 다크모드 대응 완비
        </p>
      </div>

      {/* 색상 Glass 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-glass-primary text-glass-text-primary backdrop-blur-glass shadow-glass rounded-xl p-5">
          <p className="font-semibold">Glass Primary</p>
        </div>
        <div className="bg-glass-success text-glass-text-success backdrop-blur-glass shadow-glass rounded-xl p-5">
          <p className="font-semibold">Glass Success</p>
        </div>
        <div className="bg-glass-warning text-glass-text-warning backdrop-blur-glass shadow-glass rounded-xl p-5">
          <p className="font-semibold">Glass Warning</p>
        </div>
        <div className="bg-glass-danger text-glass-text-danger backdrop-blur-glass shadow-glass rounded-xl p-5">
          <p className="font-semibold">Glass Danger</p>
        </div>
        <div className="bg-glass-neutral text-glass-text-neutral backdrop-blur-glass shadow-glass rounded-xl p-5">
          <p className="font-semibold">Glass Neutral</p>
        </div>
      </div>

      <GlassButton variant="primary">Primary</GlassButton>
      <GlassButton variant="success">Success</GlassButton>
      <GlassButton variant="warning">Warning</GlassButton>
      <GlassButton variant="danger">Danger</GlassButton>
      <GlassButton variant="neutral">Neutral</GlassButton>
      <GlassButton variant="primary" selected>
        Primary selected
      </GlassButton>
      <GlassButton variant="success" selected>
        Success selected
      </GlassButton>
      <GlassButton variant="warning" selected>
        Warning selected
      </GlassButton>
      <GlassButton variant="danger" selected>
        Danger selected
      </GlassButton>
      <GlassButton variant="neutral" selected>
        Neutral selected
      </GlassButton>
    </div>
  );
}
