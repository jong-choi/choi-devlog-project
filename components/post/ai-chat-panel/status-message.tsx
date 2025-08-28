import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/providers/chat-store-provider";

export default function StatusMessage() {
  const { isLoading, statusMessage } = useChatStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      statusMessage: state.statusMessage,
    })),
  );
  return (
    <div className="flex items-center gap-2 text-muted-foreground opacity-70">
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      <span className="text-[10px]">{statusMessage}</span>
    </div>
  );
}
