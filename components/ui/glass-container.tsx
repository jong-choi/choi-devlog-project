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

export function SectionContainer({
  children,
  title,
  titleSize = "2xl",
  description,
  mobileTransperency = false,
}: {
  children?: ReactNode;
  title: string;
  titleSize?: "2xl" | "xl";
  description?: string;
  mobileTransperency?: boolean;
}) {
  return (
    <GlassBox
      className="w-full flex flex-col gap-3"
      mobileTransperency={mobileTransperency}
    >
      <h2
        className={cn(
          "font-extrabold tracking-tighter text-shadow pb-2",
          titleSize === "2xl" && "text-2xl",
          titleSize === "xl" && "text-xl"
        )}
      >
        {title}
      </h2>
      <span
        className={cn("text-sm text-shadow -mt-2", !description && "hidden")}
      >
        {description}
      </span>
      {children}
    </GlassBox>
  );
}

export function SectionInnerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassBox className={cn("w-full bg-glass-border", className)}>
      {children}
    </GlassBox>
  );
}

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 bg-glass-bg-20 p-8 backdrop-blur-2xl -mt-4 shadow-glass",
        className
      )}
    >
      {children}
    </div>
  );
}
