import { MouseEventHandler } from "react";

export function SidebarToggle({
  onClick,
  reverse = false,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  reverse?: boolean;
}) {
  return (
    <div className="h-10 flex items-center justify-center text-gray-700 dark:text-gray-300">
      <button
        onClick={onClick}
        className="text-xs bg-transparent backdrop-blur-3xl border border-color-muted px-2 py-1 rounded"
      >
        {reverse ? "<" : ">"}
      </button>
    </div>
  );
}
