// (deprecated) - 슈퍼비전 형태로
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/providers/chat-store-provider";

export default function ChatTypeSelector() {
  const { routeType, setRouteType } = useChatStore(
    useShallow((state) => ({
      routeType: state.routeType,
      setRouteType: state.setRouteType,
    })),
  );

  const handleToggle = () => {
    const newType = routeType === "google" ? null : "google";
    setRouteType(newType);
  };

  const displayText = routeType === "google" ? "검색 켜짐" : "검색 꺼짐";

  return (
    <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
      <button
        onClick={handleToggle}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
          routeType === "google"
            ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700",
        )}
      >
        {displayText}
      </button>
    </div>
  );
}
