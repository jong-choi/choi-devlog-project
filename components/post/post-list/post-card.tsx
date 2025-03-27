import { GraphPost, PostTags } from "@/types/graph";
import Image from "next/image";

export function PostCard({ post }: { post: GraphPost & { tags: PostTags[] } }) {
  return (
    <div className="w-full bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200">
      <div className="text-sm text-gray-400 mb-2 hidden md:flex gap-2 flex-wrap">
        <span>📎</span>
        {post.tags.slice(0, 5).map((tag) => (
          <span key={tag.id} className="bg-slate-50 px-2 rounded-full">
            {tag.name}
          </span>
        ))}
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          <p className="text-gray-700 mb-4 line-clamp-3">
            {post.short_description
              ?.replaceAll("&#x3A;", ":")
              .replaceAll("https", "\nhttps")}
          </p>
          <div className="text-sm text-gray-500">🗓️ 2025.03.26</div>
        </div>

        {post.thumbnail && (
          <div className="aspect-[3/2] w-full md:w-[200px] mt-4 md:mt-2 md:ml-4 relative overflow-hidden rounded-xl shadow-md flex-shrink-0">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
