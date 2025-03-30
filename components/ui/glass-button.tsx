import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
  selected?: boolean;
  className?: string;
}

const variantClasses = {
  primary: {
    base: "bg-glass-primary text-glass-text-primary",
    selected: "bg-glass-selected-primary text-glass-text-primary",
  },
  success: {
    base: "bg-glass-success text-glass-text-success",
    selected: "bg-glass-selected-success text-glass-text-success",
  },
  warning: {
    base: "bg-glass-warning text-glass-text-warning",
    selected: "bg-glass-selected-warning text-glass-text-warning",
  },
  danger: {
    base: "bg-glass-danger text-glass-text-danger",
    selected: "bg-glass-selected-danger text-white",
  },
  neutral: {
    base: "bg-glass-neutral text-glass-text-neutral",
    selected: "bg-glass-selected-neutral text-white",
  },
};

export function GlassButton({
  variant = "primary",
  selected = false,
  className,
  children,
  ...props
}: GlassButtonProps) {
  const style = variantClasses[variant];

  return (
    <button
      {...props}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded backdrop-blur-glass transition shadow-glass hover:brightness-105 dark:hover:brightness-125 whitespace-nowrap",
        selected ? style.selected : style.base,
        className
      )}
    >
      {children}
    </button>
  );
}
