import { Category, Subcategory, Post, Panel } from "@/types/post";
import PanelItem from "@/components/post/sidebar/panels/panel-item";
import CollapsedPanel from "@/components/post/sidebar/panels/collapsed-panel";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import Link from "next/link";
import { getPostsBySubcategoryId } from "@/app/post/actions";

interface SidebarPanelProps {
  type: Panel; // 패널의 타입
  data: Category[] | Subcategory[] | Post[]; // 해당 타입에 맞는 데이터
}

export default function SidebarPanel({ type, data }: SidebarPanelProps) {
  const {
    selectedCategory,
    selectedSubcategory,
    selectedPost,
    selectedPanel,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedPost,
    setSelectedPanel,
    setSelectedPostsData,
  } = useSidebarStore((state) => state);

  // 공통적으로 사용할 선택 처리 함수들
  const onSelect = async (item: Category | Subcategory | Post) => {
    if (type === "category") {
      setSelectedCategory(item as Category);
      setSelectedSubcategory(null);
      setSelectedPanel("subcategory");
    } else if (type === "subcategory") {
      const result = await getPostsBySubcategoryId(item.id);
      setSelectedPostsData(result?.data || []);
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
          title={
            "name" in selectedItem ? selectedItem.name : selectedItem.title
          }
          onClick={onCollapsedPanelClick}
        />
      );
    }
  }

  // 데이터가 없으면 빈 화면 반환
  if (!data || data.length === 0) return null;

  const ItemContainer: React.FC<
    { urlSlug: string } & React.PropsWithChildren
  > = ({ urlSlug, children }) => {
    if (type === "post") {
      // Link 태그를 써서 pre-loading을 시도
      return <Link href={`/post/${urlSlug}`}>{children}</Link>;
    } else {
      return <div>{children}</div>;
    }
  };

  return (
    <div className="w-full p-4  border-gray-200 bg-white max-h-[60vh] overflow-y-auto scrollbar">
      {data.map((item) => {
        return (
          <ItemContainer
            key={`${type}-${item.id}`}
            urlSlug={(item as Post).url_slug}
          >
            <PanelItem
              onClick={() => onSelect(item)}
              description={"name" in item ? item.name : item.title}
              isSelected={selectedItem?.id === item.id}
            />
          </ItemContainer>
        );
      })}
    </div>
  );
}
