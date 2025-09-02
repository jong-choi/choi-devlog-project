"use client";

import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import { LinkLoader } from "@/components/ui/route-loader";
import { AdminPostData, PostStatus } from "@/types/admin";
import AdminPostActions from "./admin-post-actions";
import AdminPostStatus from "./admin-post-status";

dayjs.extend(relativeTime);

interface AdminPostsTableProps {
  posts: AdminPostData[];
  postStatuses: Record<string, PostStatus>;
  onCreateSummary: (postId: string) => void;
  onCreateRecommendations: (postId: string) => void;
  onViewSummary?: (post: AdminPostData) => void;
  onViewRecommendations?: (post: AdminPostData) => void;
}

export default function AdminPostsTable({
  posts,
  postStatuses,
  onCreateSummary,
  onCreateRecommendations,
  onViewSummary,
  onViewRecommendations,
}: AdminPostsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                제목
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                발행일
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {posts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  게시글이 없습니다.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <LinkLoader
                        href={`/post/${post.url_slug}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                      >
                        {post.title}
                      </LinkLoader>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        /{post.url_slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {post.released_at ? (
                      <div className="flex flex-col">
                        <span>
                          {new Date(post.released_at).toLocaleDateString(
                            "ko-KR",
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dayjs(post.released_at).locale("ko").fromNow()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">미발행</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <AdminPostStatus post={post} />
                  </td>
                  <td className="px-4 py-4">
                    <AdminPostActions
                      post={post}
                      status={postStatuses[post.id] || "idle"}
                      onCreateSummary={onCreateSummary}
                      onCreateRecommendations={onCreateRecommendations}
                      onViewSummary={onViewSummary}
                      onViewRecommendations={onViewRecommendations}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
