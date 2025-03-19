import SidebarApp from "@/components/post/sidebar/panels/sidebar-app";
import { SidebarState } from "@/hooks/use-sidebar";
import { SidebarStoreProvider } from "@/providers/sidebar-store-provider";
import { Category, Post } from "@/types/post";

interface PostSidebarProps {
  urlSlug?: string;
}

export default async function PostSidebar({ urlSlug }: PostSidebarProps) {
  const [categories, initialState, posts] = await Promise.all([
    fetchCategories(),
    fetchInitialData(urlSlug!),
    fetchPosts(),
  ]);
  return (
    <SidebarStoreProvider initialState={initialState}>
      <SidebarApp categories={categories} posts={posts} />
    </SidebarStoreProvider>
  );
}

const fetchInitialData = (_postId: string): Promise<Partial<SidebarState>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        selectedCategory: {
          id: 1,
          name: "프로그래밍",
          order: 1,
          subcategories: [
            { id: 10, name: "JavaScript", order: 1 },
            { id: 11, name: "Python", order: 2 },
          ],
        },
        selectedSubcategory: { id: 10, name: "JavaScript", order: 1 },
        selectedPostsData: [
          {
            id: 1,
            url_slug: "intro-to-js",
            title: "JavaScript 기초",
            short_description: "자바스크립트 기초 문법을 배워봅시다.",
            is_private: null,
            order: 1,
          },
          {
            id: 2,
            url_slug: "advanced-js",
            title: "JavaScript 고급 개념",
            short_description: "고급 개념을 알아봅시다.",
            is_private: null,
            order: 2,
          },
          {
            id: 3,
            url_slug: "async-js",
            title: "비동기 자바스크립트",
            short_description: "async/await 및 Promise 개념 설명.",
            is_private: null,
            order: 3,
          },
        ],
        selectedPost: {
          id: 2,
          url_slug: "advanced-js",
          title: "JavaScript 고급 개념",
          short_description: "고급 개념을 알아봅시다.",
          is_private: null,
          order: 2,
        },
        selectedPanel: "post",
      });
    }, 200); // 0.2초 후에 데이터 반환
  });
};

const fetchCategories = (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "프로그래밍",
          order: 1,
          subcategories: [
            { id: 10, name: "JavaScript", order: 1 },
            { id: 11, name: "Python", order: 2 },
          ],
        },
        {
          id: 2,
          name: "디자인",
          order: 2,
          subcategories: [
            { id: 20, name: "UI/UX", order: 1 },
            { id: 21, name: "그래픽 디자인", order: 2 },
          ],
        },
      ]);
    }, 200); // 0.2초 후에 데이터 반환
  });
};

const fetchPosts = (): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          url_slug: "intro-to-js",
          title: "JavaScript 기초",
          short_description: "자바스크립트 기초 문법을 배워봅시다.",
          is_private: null,
          order: 1,
        },
        {
          id: 2,
          url_slug: "advanced-js",
          title: "JavaScript 고급 개념",
          short_description: "고급 개념을 알아봅시다.",
          is_private: null,
          order: 2,
        },
        {
          id: 3,
          url_slug: "async-js",
          title: "비동기 자바스크립트",
          short_description: "async/await 및 Promise 개념 설명.",
          is_private: null,
          order: 3,
        },
      ]);
    }, 200); // 0.2초 후에 데이터 반환
  });
};
