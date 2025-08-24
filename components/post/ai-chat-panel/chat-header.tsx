import { MessageCircle } from "lucide-react";

interface ChatHeaderProps {
  rightPanelOpen: boolean;
  onTogglePanel: () => void;
}

export function ChatHeader({ rightPanelOpen, onTogglePanel }: ChatHeaderProps) {
  return (
    <div className="px-4 py-2 flex gap-5 items-center">
      <button
        onClick={onTogglePanel}
        className="z-10 text-xs px-2 py-1 rounded self-start bg-glass-bg border border-glass-border shadow-glass backdrop-blur-glass"
      >
        {!rightPanelOpen ? "<" : ">"}
      </button>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-tight">AI 채팅</span>
        </div>
        <span className="text-[8px] font-light tracking-tight text-color-muted">
          MODEL : NAVER HyperCLOVA X SEED 1.5B-Q4_K_M
        </span>
      </div>
    </div>
  );
}
