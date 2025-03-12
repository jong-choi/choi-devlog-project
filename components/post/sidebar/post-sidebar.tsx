import SidebarApp from "@/components/post/sidebar/panels/sidebar-app";
import { SidebarState } from "@/hooks/use-sidebar";
import { SidebarStoreProvider } from "@/providers/sidebar-store-provider";
import { Category } from "@/types/post";

interface PostSidebarProps {
  postId: string;
}

export default async function PostSidebar({ postId }: PostSidebarProps) {
  const categories = await fetchCategories();
  const initialState = await fetchInitalData();
  return (
    <SidebarStoreProvider initialState={initialState}>
      <div>{postId}</div>
      <SidebarApp categories={categories} />
    </SidebarStoreProvider>
  );
}

const fetchInitalData = (): Promise<Partial<SidebarState>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        selectedCategory: {
          id: 1,
          name: "프론트엔드",
          subcategories: [
            {
              id: 101,
              name: "React",
              posts: [
                { id: 1001, name: "React 기초" },
                { id: 1002, name: "Hooks 완전 정복" },
              ],
            },
            {
              id: 102,
              name: "Vue",
              posts: [{ id: 1003, name: "Vue 3 소개" }],
            },
          ],
        },
        selectedSubcategory: {
          id: 201,
          name: "Node.js",
          posts: [{ id: 2001, name: "Express.js 가이드" }],
        },
        selectedPost: { id: 1002, name: "Hooks 완전 정복" },
        selectedPanel: "post",
      });
    }, 2000); // 2초 후에 데이터 반환
  });
};

const fetchCategories = (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "프론트엔드",
          subcategories: [
            {
              id: 101,
              name: "React",
              posts: [
                { id: 1001, name: "React 기초" },
                { id: 1002, name: "Hooks 완전 정복" },
              ],
            },
            {
              id: 102,
              name: "Vue",
              posts: [{ id: 1003, name: "Vue 3 소개" }],
            },
          ],
        },
        {
          id: 2,
          name: "백엔드",
          subcategories: [
            {
              id: 201,
              name: "Node.js",
              posts: [{ id: 2001, name: "Express.js 가이드" }],
            },
          ],
        },
      ]);
    }, 2000); // 2초 후에 데이터 반환
  });
};
