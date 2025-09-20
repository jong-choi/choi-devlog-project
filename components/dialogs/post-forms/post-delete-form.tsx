"use client";
import { toast } from "sonner";
import DeleteForm from "@/components/form/delete-form";
import { Post } from "@/types/post";
import { softDeletePost } from "@/app/post/actions";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import notSavedToast from "@/utils/not-saved-toast";
import { useAuthStore } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function PostDeleteForm({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const { selectedPostId, posts } = useSidebarStore(
    useShallow((state) => ({
      posts: state.posts,
      selectedPostId: state.selectedPostId,
    }))
  );
  const { setPostsPending } = useLayoutStore(
    useShallow((state) => ({
      setPostsPending: state.setPostsPending,
    }))
  );
  const router = useRouter();
  const { isValid } = useAuthStore(
    useShallow((state) => ({
      isValid: state.isValid,
    }))
  );

  const handleDelete = async () => {
    if (!isValid) {
      notSavedToast();
      onClose();
      return;
    }
    try {
      const { error } = await softDeletePost(post.id);
      if (error) {
        toast.error("삭제 실패", { description: error.message });
      } else {
        // 게시글 삭제 후 남아있는 게시글 중 하나로 이동
        if (selectedPostId === post.id && posts?.length) {
          for (let i = 1; i <= posts.length; i++) {
            const targetPost = posts.at(-i);
            if (targetPost && targetPost.id !== selectedPostId) {
              router.push(`/post/${targetPost.url_slug}`);
              break;
            }
          }
        }
        toast.success("게시글이 삭제되었습니다.");
        // 게시을 이동 후 posts가 업데이트 하도록 setTimeout
        setTimeout(() => setPostsPending(true), 0);
      }
    } catch (e) {
      console.error(e);
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      onClose();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <div>{post.title}</div>
      <DeleteForm onConfirm={handleDelete} onClose={onClose} entityLabel={post.title} />
    </div>
  );
}
