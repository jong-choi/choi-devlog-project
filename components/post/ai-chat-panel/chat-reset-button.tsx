import { RefreshCw } from "lucide-react";
import { Button } from "@ui/button";
import { useResetTimer } from "@/hooks/use-reset-timer";
import { cn } from "@/lib/utils";

interface ChatResetButtonProps {
  onResetSession: () => void;
  isLoading: boolean;
}

export default function ChatResetButton({
  onResetSession,
}: ChatResetButtonProps) {
  const { canReset } = useResetTimer();

  return (
    <Button
      onClick={onResetSession}
      disabled={!canReset}
      variant="ghost"
      size="sm"
      className={cn(
        "text-xs px-3 py-1.5 h-auto text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300",
        !canReset && "opacity-50",
      )}
    >
      초기화
      <RefreshCw />
    </Button>
  );
}
