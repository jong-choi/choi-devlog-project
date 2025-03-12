import PostSidebar from "@/components/post/sidebar/post-sidebar";
import PostTopBar from "@/components/post/topBar/post-top-bar";
import { Category } from "@/types/post";

export default function TodoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoriesData: Category[] = [
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
  ];

  return (
    <main className="w-full h-full flex flex-col">
      <PostTopBar />
      <section className="flex flex-row flex-1">
        <PostSidebar categories={categoriesData} />
        <article className="flex-1 overflow-auto">{children}</article>{" "}
      </section>
    </main>
  );
}
