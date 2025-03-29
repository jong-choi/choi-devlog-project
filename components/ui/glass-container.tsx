import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassBoxProps extends React.ComponentProps<"div"> {
  children: ReactNode;
  mobileTransperency?: boolean;
}

export function GlassBox({
  className,
  children,
  mobileTransperency = false,
  ...props
}: GlassBoxProps) {
  return (
    <div
      {...props}
      className={cn(
        mobileTransperency
          ? "border-glass-border p-6 text-color-base md:backdrop-blur-glass md:border md:bg-glass-bg md:shadow-glass"
          : "bg-glass-bg border border-glass-border shadow-glass backdrop-blur-glass p-6 text-color-base",
        className
      )}
    >
      {children}
    </div>
  );
}
