import { AdminPostRes } from "@/app/api/(fetchers)/admin/route";
import AdminActions from "@/components/admin/admin-actions";
import AdminFilters from "@/components/admin/admin-filters";
import AdminPostsTable from "@/components/admin/admin-posts-table";
import { AdminTableStoreProvider } from "@/providers/admin-table-store-provider";

export default async function AdminPostTableRenderer() {
  const { data: allPosts } = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin`,
  ).then((response) => response.json() as Promise<AdminPostRes>);

  return (
    <AdminTableStoreProvider>
      <AdminFilters />
      <AdminActions />
      <AdminPostsTable allPosts={allPosts} />
    </AdminTableStoreProvider>
  );
}
