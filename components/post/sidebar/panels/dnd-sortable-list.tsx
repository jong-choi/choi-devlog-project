"use client"; // Next.js의 Client Component로 지정

import { ReactNode, useEffect, useState } from "react";
import {
  DndContext, // DnD(Drag and Drop) 컨텍스트 제공
  closestCenter, // 가장 가까운 요소를 감지하는 충돌 감지 알고리즘
  KeyboardSensor, // 키보드를 사용하여 드래그 가능하도록 감지하는 센서
  PointerSensor, // 마우스 및 터치 이벤트를 감지하는 센서
  useSensor, // 개별 센서를 생성하는 훅
  useSensors, // 여러 개의 센서를 조합하는 훅
  DragEndEvent, // 드래그가 끝났을 때 발생하는 이벤트 타입
} from "@dnd-kit/core";

import {
  SortableContext, // 정렬 가능한 리스트의 컨텍스트 제공
  verticalListSortingStrategy, // 수직 리스트 정렬 전략
  // arrayMove, // 배열 내 요소의 순서를 변경하는 함수
  useSortable, // 개별 항목을 정렬 가능하도록 만드는 훅
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities"; // CSS 변환을 위한 유틸리티
import { Category, Post, Subcategory } from "@/types/post";
import PanelItem from "@/components/post/sidebar/panels/panel-item";
import Link from "next/link";

// 개별 정렬 가능한 항목 컴포넌트
const SortableItem = ({
  id,
  item,
  onSelect,
  isSelected,
}: {
  id: string;
  item: Category | Subcategory | Post;
  onSelect: (item: Category | Subcategory | Post) => Promise<void>;
  isSelected: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id }); // DnD를 적용할 요소에 대한 설정을 반환

  const style = {
    transform: CSS.Transform.toString(transform), // 요소의 드래그 변환을 적용
    transition, // 부드러운 애니메이션 효과
    padding: "10px",
    marginBottom: "5px",
    backgroundColor: "lightblue",
    borderRadius: "5px",
    cursor: "grab", // 드래그 가능하다는 표시
  };

  const Wrapper = ({ children }: { children: ReactNode }) => {
    if ("url_slug" in item) {
      return <Link href={item.url_slug ?? "#"}>{children}</Link>;
    }
    return <>{children}</>;
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Wrapper>
        <PanelItem
          key={item.id}
          onClick={() => {
            onSelect(item);
          }}
          description={"name" in item ? item.name : item.title}
          isSelected={isSelected}
        />
      </Wrapper>
      <div {...attributes} {...listeners}>
        선택
      </div>
    </div>
  );
};

// 정렬 가능한 리스트 컴포넌트
export default function SortableList({
  data,
  selectedItem,
  onSelect,
}: {
  data: Category[] | Post[] | Subcategory[];
  selectedItem: Category | Subcategory | Post | null;
  onSelect: (item: Category | Subcategory | Post) => Promise<void>;
}) {
  const [items, setItems] = useState<Category[] | Post[] | Subcategory[]>([]); // 정렬할 아이템 리스트 상태
  useEffect(() => {
    console.log(data);
    if (data) {
      setItems(data);
    }
  }, [data]);

  useEffect(() => {
    console.log(JSON.stringify(items));
  }, [items]);

  // 사용 센서 정의: 마우스 및 키보드 센서를 동시에 사용
  const sensors = useSensors(
    useSensor(PointerSensor), // 마우스, 터치 감지
    useSensor(KeyboardSensor) // 키보드로 드래그 가능
  );

  const getNewOrder = (prevOrder: number | null, nextOrder: number | null) => {
    if (prevOrder === null) return nextOrder! / 2; // 맨 앞에 삽입
    if (nextOrder === null) return prevOrder + 100; // 맨 뒤에 삽입
    return (prevOrder + nextOrder) / 2; // 두 요소 사이에 삽입
  };
  // 드래그 종료 시 실행되는 이벤트 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event; // 드래그된 항목(active)과 놓인 위치(over) 가져오기

    if (!over) return; // over가 null이면 아무 작업도 하지 않음 (드롭할 위치가 없을 때)

    if (String(active.id) !== String(over.id)) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);

        // 이동한 요소를 제거
        const movingItem = prev[oldIndex];
        const newList = prev.filter((_, index) => index !== oldIndex);

        // 이전, 다음 요소 찾기
        const prevItem = newList[newIndex - 1] || null;
        const nextItem = newList[newIndex] || null;

        // 새로운 order 계산
        const newOrder = getNewOrder(
          prevItem ? prevItem.order : null,
          nextItem ? nextItem.order : null
        );

        // 새로운 위치에 요소 삽입
        newList.splice(newIndex, 0, { ...movingItem, order: newOrder });

        return newList as typeof prev;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors} // 센서 적용
      collisionDetection={closestCenter} // 가장 가까운 요소를 감지하는 알고리즘 적용
      onDragEnd={handleDragEnd} // 드래그 종료 이벤트 핸들러
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items?.map((item) => (
          <SortableItem
            key={item.id}
            id={item.id}
            item={item}
            onSelect={onSelect}
            isSelected={selectedItem?.id === item.id}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
