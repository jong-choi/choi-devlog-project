import { useCallback, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@ui/button";
import { Textarea } from "@ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  const [hasText, setHasText] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24;
      const padding = 24;
      const maxHeight = lineHeight * 4 + padding;

      textareaRef.current.style.height =
        Math.min(scrollHeight, maxHeight) + "px";

      const currentHasText = textareaRef.current.value.trim().length > 0;
      setHasText(currentHasText);

      const length = textareaRef.current.value.length;
      if (length && length >= 300) {
        textareaRef.current.value = textareaRef.current.value.slice(0, 300);
      }
    }
  }, []);

  const canSend = hasText && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textareaRef.current || !canSend) return;

    const message = textareaRef.current.value.trim();
    if (!message) return;

    onSendMessage(message);
    textareaRef.current.value = "";
    setHasText(false);
    textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          onChange={adjustTextareaHeight}
          rows={1}
          placeholder="메시지를 입력하세요..."
          className={cn(
            "min-h-[44px] resize-none rounded-xl border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 overflow-hidden",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm leading-6 text-neutral-900 dark:text-neutral-100",
            "py-3 px-4 pr-12",
          )}
          style={{ height: "auto" }}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="submit"
          disabled={!canSend}
          size="icon"
          className={cn(
            "absolute right-2 bottom-2 h-8 w-8 rounded-lg",
            "bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600",
            "transition-colors duration-200",
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
