import {
  getPostsBySubcategoryId,
  getRecommendedByPostId,
  getSelectedCategoriesByUrl,
} from "@/app/post/actions";
import { SidebarState } from "@/hooks/use-sidebar";
import { SidebarStoreProvider } from "@/providers/sidebar-store-provider";
import { Category } from "@/types/post";

interface PostSidebarProps {
  urlSlug: string;
  categories: Category[];
  children: React.ReactNode;
}

export default async function PostSidebarWrapper({
  urlSlug = "",
  categories,
  children,
}: PostSidebarProps) {
  const initialState: Partial<SidebarState> = {
    categories: categories,
    selectedCategory: null,
    selectedSubcategory: null,
    selectedPostsData: null,
    selectedPost: null,
    selectedRecommendedPosts: null,
    selectedPanel: "category",
  };
  if (urlSlug) {
    const result = await getSelectedCategoriesByUrl(
      decodeURIComponent(urlSlug)
    );
    const data = result.data;
    if (data) {
      initialState.selectedCategory = data.category;
      initialState.selectedSubcategory = data.subcategory;
      initialState.selectedPost = data.post;
      initialState.selectedPanel = "post";
    }
  }
  if (initialState.selectedSubcategory?.id) {
    const result = await getPostsBySubcategoryId(
      initialState.selectedSubcategory.id
    );
    if (result) {
      initialState.selectedPostsData = result.data;
    }
  }
  if (initialState.selectedPost?.id) {
    const result = await getRecommendedByPostId(initialState.selectedPost?.id);
    if (result) {
      initialState.selectedRecommendedPosts = result.data;
      initialState.selectedPanel = "recommended";
    }
  }

  return (
    <SidebarStoreProvider initialState={initialState}>
      {children}
    </SidebarStoreProvider>
  );
}
