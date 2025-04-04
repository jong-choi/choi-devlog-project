import { cn } from "@/lib/utils";
import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
  selected?: boolean;
  className?: string;
}

const variantClasses = {
  primary: {
    base: "bg-glass-primary text-glass-text-primary border border-glass-text-primary/60",
    selected: "bg-glass-selected-primary text-glass-text-primary",
  },
  success: {
    base: "bg-glass-success text-glass-text-success  border border-glass-text-success/60",
    selected: "bg-glass-selected-success text-glass-text-success",
  },
  warning: {
    base: "bg-glass-warning text-glass-text-warning border border-glass-text-warning/60",
    selected: "bg-glass-selected-warning text-glass-text-warning",
  },
  danger: {
    base: "bg-glass-danger text-glass-text-danger border border-glass-text-danger/60",
    selected: "bg-glass-selected-danger text-white",
  },
  neutral: {
    base: "bg-glass-neutral text-glass-text-neutral border border-glass-text-neutral/60",
    selected: "bg-glass-selected-neutral text-white",
  },
};

export function GlassButton({
  variant = "primary",
  selected = false,
  className,
  children,
  disabled,
  ...props
}: GlassButtonProps) {
  const style = variantClasses[variant];

  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded backdrop-blur-glass transition whitespace-nowrap",
        selected ? style.selected : style.base,
        !disabled &&
          "hover:brightness-105 dark:hover:brightness-125 shadow-glass",
        disabled && "opacity-50 cursor-not-allowed shadow-inner",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SectionLinkText({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="self-end">
      <GlassButton className="text-shadow">{children}</GlassButton>
    </Link>
  );
}
