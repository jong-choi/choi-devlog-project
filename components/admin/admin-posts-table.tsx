import AdminPostTableRow from "./admin-post-table-row";
import AdminActions from "./admin-actions";

type PostData = {
  id: string;
  title: string;
  url_slug: string;
  created_at: string;
  body?: string;
  ai_summaries: { count?: number }[];
  post_similarities: { count?: number }[];
};

type AdminPostsTableProps = {
  posts: PostData[];
  loading: boolean;
  revalidateCacheTags: (tags: string[]) => Promise<void>;
  onDataRefresh: () => Promise<void>;
};

export default function AdminPostsTable({
  posts,
  loading,
  revalidateCacheTags,
  onDataRefresh,
}: AdminPostsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between">
        <h2 className="text-xl font-semibold">
          게시글 목록 (총 {posts.length}개)
        </h2>
        <AdminActions
          revalidateCacheTags={revalidateCacheTags}
          onDataRefresh={onDataRefresh}
        />
      </div>

      {loading ? (
        <div className="p-8 text-center">로딩 중...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL 슬러그
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI 요약
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  추천
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <AdminPostTableRow
                  key={post.id}
                  post={post}
                  revalidateCacheTags={revalidateCacheTags}
                  onDataRefresh={onDataRefresh}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}