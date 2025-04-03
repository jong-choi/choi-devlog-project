"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
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
      className="flex items-center gap-1 cursor-grab active:cursor-grabbing group"
      {...attributes}
      {...listeners}
    >
      <div className="flex-1 truncate whitespace-nowrap overflow-hidden text-ellipsis">
        {children}
      </div>
      <div className="text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-200 pl-1">
        <GripVertical className="w-4 h-4 shrink-0" />
      </div>
    </div>
  );
}
