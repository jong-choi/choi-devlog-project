"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical } from "lucide-react";
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
      className="relative items-center gap-1 cursor-grab active:cursor-grabbing group"
      {...attributes}
      {...listeners}
    >
      <div className="relative flex-1 truncate whitespace-nowrap overflow-hidden text-ellipsis pl-1">
        {children}
      </div>
      <div className="absolute w-4 h-5 top-2  text-color-muted">
        <MoreVertical className="w-4 h-5 shrink-0" />
      </div>
    </div>
  );
}
