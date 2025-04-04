"use client";

import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

interface SortableItemWrapperProps {
  id: string;
  children: ReactNode;
}

export function SortableItemWrapper({
  id,
  children,
}: SortableItemWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex-1 whitespace-nowrap overflow-hidden")}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
