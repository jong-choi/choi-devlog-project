import AdminActions from "@/components/admin/admin-actions";
import AdminFilters from "@/components/admin/admin-filters";
import AdminPostsTable from "@/components/admin/admin-posts-table";
import { AdminTableStoreProvider } from "@/providers/admin-table-store-provider";

type PostData = {
  id: string;
  title: string;
  url_slug: string;
  created_at: string;
  body?: string;
  ai_summaries: { count?: number }[];
  post_similarities: { count?: number }[];
};

type ApiResponse = {
  data: PostData[];
  total: number;
};

export default async function AdminPostTableRenderer() {
  const { data: allPosts } = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin`,
  ).then((response) => response.json() as Promise<ApiResponse>);

  return (
    <AdminTableStoreProvider>
      <AdminFilters />
      <AdminActions />
      <AdminPostsTable allPosts={allPosts} />
    </AdminTableStoreProvider>
  );
}
