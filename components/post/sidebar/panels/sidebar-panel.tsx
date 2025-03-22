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
      setSelectedPost(item as Post);
      setSelectedPanel("recommended");
      setSelectedRecommendedPosts(result?.data || []);
    } else if (type === "recommended") {
      router.push(
        "/post/" + decodeURIComponent((item as RecommendedPost).target_url_slug)
      );
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
        "w-full relative transition-all duration-300 ease-out overflow-auto scrollbar-hidden border-collapse ",
        selectedPanel !== type
          ? type === "recommended"
            ? "h-0px"
            : "h-[50px] border-t"
          : "h-full border-t"
      )}
    >
      {selectedPanel !== type ? (
        selectedItem &&
        type !== "recommended" && (
          <CollapsedPanel
            icon={type}
            title={
              "name" in selectedItem ? selectedItem.name : selectedItem.title
            }
            onClick={onCollapsedPanelClick}
          />
        )
      ) : (
        <div className="w-full h-full border-gray-200 scrollbar-hidden ">
          <div className={cn(type === "category" && "")}>
            {type === "recommended" && (
              <div className="w-full text-center mt-2 p-2 underline underline-offset-4 text-sm font-semibold select-none">
                추천 게시글
              </div>
            )}
            <SortableList
              data={parsedData}
              selectedItem={selectedItem}
              onSelect={onSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}
