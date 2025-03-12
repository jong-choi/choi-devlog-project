import SidebarApp from "@/components/post/sidebar/panels/sidebar-app";
import { Category } from "@/types/post";

export default async function PostSidebar() {
  const categories = await fetchCategories();

  return <SidebarApp categories={categories} />;
}

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
