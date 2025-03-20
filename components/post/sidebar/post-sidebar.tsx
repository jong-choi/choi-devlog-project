import {
  getPostsBySubcategoryId,
  getRecommendedByPostId,
  getSelectedCategoriesByUrl,
  getSidebarCategory,
} from "@/app/post/actions";
import SidebarApp from "@/components/post/sidebar/panels/sidebar-app";
import { SidebarState } from "@/hooks/use-sidebar";
import { SidebarStoreProvider } from "@/providers/sidebar-store-provider";

interface PostSidebarProps {
  urlSlug?: string;
}

export default async function PostSidebar({ urlSlug }: PostSidebarProps) {
  const { data } = await getSidebarCategory();
  const categories = data || [];
  const initialState: Partial<SidebarState> = {
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
      <SidebarApp categories={categories} />
    </SidebarStoreProvider>
  );
}
