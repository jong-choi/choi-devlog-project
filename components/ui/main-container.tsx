import { cn } from "@/lib/utils";

export function MainContainer({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:rounded-xl md:shadow-sm",
        className
      )}
      {...props}
    />
  );
}
