import { Button } from "@ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { RefObject, useState } from "react";

type RouteType = "chat" | "google" | "summary" | "recommend";

interface RouteTypeSelectorProps {
  routeTypeRef: RefObject<RouteType>;
  onResetSession: () => void;
  isLoading: boolean;
}

export function RouteTypeSelector({
  routeTypeRef,
  onResetSession,
  isLoading,
}: RouteTypeSelectorProps) {
  const [routeType, setRouteType] = useState("chat");
  const handleToggle = () => {
    const newType = routeType === "google" ? "chat" : "google";
    setRouteType(newType);
    routeTypeRef.current = newType;
  };

  const displayText =
    routeType === "google" ? "Google 검색 켜짐" : "Google 검색 꺼짐";

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            routeType === "google"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700"
          )}
        >
          {displayText}
        </button>
      </div>
      <Button
        onClick={onResetSession}
        variant="ghost"
        size="sm"
        className="text-xs px-3 py-1.5 h-auto text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
        disabled={isLoading}
      >
        초기화
        <RefreshCw />
      </Button>
    </div>
  );
}
