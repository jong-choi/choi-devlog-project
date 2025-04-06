import { SidebarState } from "@/hooks/zustand/use-sidebar-store";
import { SidebarStoreProvider } from "@/providers/sidebar-store-provider";
import { Category, Post } from "@/types/post";
import { POST_PAGE_COOKIE_KEYS } from "@/utils/cookies/post-page-cookie";
import { cookies } from "next/headers";

interface PostSidebarProps {
  urlSlug?: string;
  categories: Category[];
  posts: Post[];
  children: React.ReactNode;
}

export default async function PostSidebarWrapper({
  urlSlug = "",
  categories,
  posts,
  children,
}: PostSidebarProps) {
  const cookieStore = await cookies();
  const isSortable =
    cookieStore.get(POST_PAGE_COOKIE_KEYS.SIDEBAR.isSortable)?.value === "true";

  const initialState: Partial<SidebarState> = {
    categories: categories,
    selectedCategoryId: categories[0].id,
    selectedSubcategoryId: null,
    selectedSubcategoryName: null,
    selectedPostId: null,
    openedCategories: {},
    isSortable,
  };

  const post = posts.find((p) => p.url_slug === decodeURIComponent(urlSlug));
  if (post) {
    initialState.selectedPostId = post.id;

    for (const category of categories) {
      const subcategory = category.subcategories.find(
        (sub) => sub.id === post.subcategory_id
      );

      if (subcategory) {
        initialState.selectedCategoryId = category.id;
        initialState.selectedSubcategoryId = subcategory.id;
        initialState.selectedSubcategoryName = subcategory.name;
        initialState.openedCategories = {
          [category.id]: true,
        };
        break;
      }
    }
  }

  return (
    <SidebarStoreProvider initialState={initialState}>
      {children}
    </SidebarStoreProvider>
  );
}
