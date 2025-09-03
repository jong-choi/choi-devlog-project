import AdminHeader from "@/components/admin/admin-header";
import AdminPostTableRenderer from "@/components/admin/admin-post-table-renderer";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminHeader />
      <AdminPostTableRenderer />
    </div>
  );
}
