"use client";

import Link from "next/link";
import { AdminPostData } from "@/app/api/(fetchers)/admin/route";
import AdminActionButtons from "./admin-action-buttons";

type AdminPostTableRowProps = {
  post: AdminPostData;
};

export default function AdminPostTableRow({ post }: AdminPostTableRowProps) {
  return (
    <tr key={post.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          href={`/post/${post.url_slug}`}
          className="font-medium text-gray-900"
        >
          {post.title}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {post.url_slug}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(post.created_at || "").toLocaleDateString("ko-KR")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>{!!post.ai_summaries ? "존재함" : "없음"}</span>
          <AdminActionButtons post={post} type="summary" />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>{post.post_similarities[0]?.count || 0}</span>
          <AdminActionButtons post={post} type="similarity" />
        </div>
      </td>
    </tr>
  );
}
