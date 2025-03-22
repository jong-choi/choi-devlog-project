import {
  Category,
  Subcategory,
  Post,
  Panel,
  RecommendedPost,
} from "@/types/post";
import CollapsedPanel from "@/components/post/sidebar/panels/collapsed-panel";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import {
  getPostsBySubcategoryId,
  getRecommendedByPostId,
} from "@/app/post/actions";
import SortableList from "@/components/post/sidebar/panels/dnd-sortable-list";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarPanelProps {
  type: Panel; // 패널의 타입
  data: Category[] | Subcategory[] | Post[] | RecommendedPost[]; // 해당 타입에 맞는 데이터
}

export default function SidebarPanel({ type, data }: SidebarPanelProps) {
  const router = useRouter();

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
    setSelectedRecommendedPosts,
  } = useSidebarStore((state) => state);

  // 공통적으로 사용할 선택 처리 함수들
  const onSelect = async (
    item: Category | Subcategory | Post | RecommendedPost
  ) => {
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
      const result = await getRecommendedByPostId(item.id);
      setSelectedRecommendedPosts(result?.data || []);
      setSelectedPost(item as Post);
      setSelectedPanel("recommended");
    } else if (type === "recommended") {
      router.push(
        "/post/" + decodeURIComponent((item as RecommendedPost).target_url_slug)
      );
    }
  };

  // 공통된 collapsed 패널 클릭 처리
  const onCollapsedPanelClick = () => {
    if (type !== selectedPanel) {
      setSelectedPanel(type);
    } else {
      if (type === "category") {
        setSelectedPanel("subcategory");
      }
      if (type === "subcategory") {
        setSelectedPanel("post");
      }
      if (type === "post") {
        setSelectedPanel("recommended");
      }
    }
  };

  // 선택된 패널에 맞는 collapsed 패널을 보여주는 부분
  const selectedItem =
    type === "category"
      ? selectedCategory
      : type === "subcategory"
      ? selectedSubcategory
      : selectedPost;

  const parsedData =
    type === "recommended"
      ? ((data as RecommendedPost[]).map((item, index) => {
          const newItem: Post = {
            id: "",
            title: "",
            url_slug: "",
            short_description: "",
            is_private: false,
            order: 0,
          };
          newItem.id = item.target_post_id;
          newItem.title = item.target_title;
          newItem.url_slug = item.target_url_slug;
          newItem.order = 100000 + 100000 * index;
          return newItem;
        }) as Post[])
      : (data as Subcategory[] | Category[] | Post[]);

  return (
    <div
      className={cn(
        "w-full min-h-0 max-h-[70vh] relative overflow-hidden border-collapse flex flex-col"
      )}
    >
      {/* 항상 보이는 CollapsedPanel */}
      {type !== "recommended" && (
        <CollapsedPanel
          icon={type}
          title={
            !selectedItem
              ? "-"
              : "name" in selectedItem
              ? selectedItem.name
              : selectedItem.title
          }
          onClick={onCollapsedPanelClick}
        />
      )}
      {/* 조건부로 보여줄 콘텐츠 영역 */}
      {selectedPanel === type && (
        <div
          className={cn(
            "flex-1 overflow-y-auto border-gray-200 scrollbar-hidden",
            type === "recommended" && "border-t"
          )}
        >
          {type === "recommended" && (
            <div className="w-full flex-shrink-0 text-center pt-4 pb-2 underline underline-offset-4  text-sm font-semibold select-none">
              추천 게시글
            </div>
          )}
          {!parsedData.length ? (
            <div className="text-center text-xs">게시글이 없습니다.</div>
          ) : (
            <SortableList
              data={parsedData}
              selectedItem={selectedItem}
              onSelect={onSelect}
            />
          )}
        </div>
      )}
    </div>
  );
}
