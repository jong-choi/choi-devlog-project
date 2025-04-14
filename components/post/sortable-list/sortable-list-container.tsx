"use client";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { ReactNode, useEffect, useState } from "react";
import {
  OnUpdateFn,
  useOrderUpdateQueue,
} from "@/hooks/use-order-update-queue";
import { cn } from "@/lib/utils";

export type SortableItem = { id: string; order: number | null };

interface SortableListContainerProps<T extends SortableItem> {
  items: T[];
  children: (items: T[]) => ReactNode;
  onUpdate?: OnUpdateFn<{ id: string; order: number }>;
}

export function SortableListContainer<T extends SortableItem>({
  items,
  children,
  onUpdate,
}: SortableListContainerProps<T>) {
  const [localItems, setLocalItems] = useState<T[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),

    useSensor(KeyboardSensor)
  );

  const { addToQueue } = useOrderUpdateQueue(onUpdate);

  const getNewOrder = (prevOrder: number | null, nextOrder: number | null) => {
    if (prevOrder === null) return nextOrder! / 2;
    if (nextOrder === null) return prevOrder + 100;
    return (prevOrder + nextOrder) / 2;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setLocalItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        const movingItem = prev[oldIndex];
        const newList = [...prev];
        newList.splice(oldIndex, 1);

        const prevItem = newList[newIndex - 1] ?? null;
        const nextItem = newList[newIndex] ?? null;

        const newOrder = getNewOrder(
          prevItem?.order ?? null,
          nextItem?.order ?? null
        );

        if (movingItem.order !== newOrder) {
          const updatedItem = { ...movingItem, order: newOrder };
          newList.splice(newIndex, 0, updatedItem);
          addToQueue(updatedItem);
          return newList;
        }

        newList.splice(newIndex, 0, movingItem);
        return newList;
      });
    }
    setIsDragging(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={localItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn(isDragging && "pointer-events-none")}>
          {children(localItems)}
        </div>
      </SortableContext>
    </DndContext>
  );
}
