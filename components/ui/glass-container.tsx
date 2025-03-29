import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassBoxProps extends React.ComponentProps<"div"> {
  children: ReactNode;
}

export function GlassBox({ className, children, ...props }: GlassBoxProps) {
  return (
    <div
      {...props}
      className={cn(
        "bg-glass-bg border border-glass-border shadow-glass backdrop-blur-glass p-6 text-color-base",
        className
      )}
    >
      {children}
    </div>
  );
}
