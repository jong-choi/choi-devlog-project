import { useSidebarStore } from "@/hooks/use-sidebar";
import { Category, Subcategory, Post } from "@/types/post";
import PanelItem from "@/components/post/sidebar/panels/panel-item";
import CollapsedPanel from "@/components/post/sidebar/panels/collapsed-panel";

interface SidebarPenelProps {
  type: "category" | "subcategory" | "post"; // 패널의 타입
  data: Category[] | Subcategory[] | Post[]; // 해당 타입에 맞는 데이터
}

export default function SidebarPenel({ type, data }: SidebarPenelProps) {
  const {
    selectedCategory,
    selectedSubcategory,
    selectedPost,
    selectedPanel,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedPost,
    setSelectedPanel,
  } = useSidebarStore((state) => state);

  // 공통적으로 사용할 선택 처리 함수들
  const onSelect = (item: Category | Subcategory | Post) => {
    if (type === "category") {
      setSelectedCategory(item as Category);
      setSelectedSubcategory(null);
      setSelectedPanel("subcategory");
    } else if (type === "subcategory") {
      setSelectedSubcategory(item as Subcategory);
      setSelectedPost(null);
      setSelectedPanel("post");
    } else if (type === "post") {
      setSelectedPost(item as Post);
    }
  };

  // 공통된 collapsed 패널 클릭 처리
  const onCollapsedPanelClick = () => {
    setSelectedPanel(type);
  };

  // 선택된 패널에 맞는 collapsed 패널을 보여주는 부분
  const selectedItem =
    type === "category"
      ? selectedCategory
      : type === "subcategory"
      ? selectedSubcategory
      : selectedPost;

  if (selectedPanel !== type) {
    if (!selectedItem) {
      return <></>;
    }

    if (selectedItem) {
      return (
        <CollapsedPanel
          icon={type}
          title={selectedItem.name}
          onClick={onCollapsedPanelClick}
        />
      );
    }
  }

  // 데이터가 없으면 빈 화면 반환
  if (!data || data.length === 0) return null;

  // 각 항목을 PanelItem으로 렌더링
  return (
    <div className="w-64 p-4 border-r border-gray-200 bg-white max-h-[60vh] overflow-y-auto scrollbar">
      {data.map((item) => (
        <PanelItem
          key={`${type}-${item.id}`}
          onClick={() => onSelect(item)}
          description={item.name}
          isSelected={selectedItem?.id === item.id}
        />
      ))}
    </div>
  );
}
