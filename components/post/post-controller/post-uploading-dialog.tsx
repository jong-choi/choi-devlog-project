import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { createPost, updatePost } from "@/app/post/actions";
import PostUploadingForm from "@/components/post/post-controller/post-uploading-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/providers/auth-provider";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useLayoutStore } from "@/providers/layout-store-provider";
import {
  extractFirstImageFromText,
  extractTextFromMarkdown,
  slugify,
} from "@/utils/uploadingUtils";

export function UploadingDialogTrigger() {
  const {
    recentAutoSavedData,
    setDraftPostData,
    draftPostData,
    postId,
    setIsUploading,
    setIsUploaded,
  } = useAutosave(
    useShallow((state) => ({
      recentAutoSavedData: state.recentAutoSavedData,
      setDraftPostData: state.setDraftPostData,
      draftPostData: state.draftPostData,
      postId: state.postId,
      setIsUploading: state.setIsUploading,
      setIsUploaded: state.setIsUploaded,
    })),
  );

  const { isValid } = useAuthStore(
    useShallow((state) => ({
      isValid: state.isValid,
    })),
  );

  const { setPostsPending } = useLayoutStore(
    useShallow((state) => ({
      setPostsPending: state.setPostsPending,
    })),
  );

  const router = useRouter();
  const onClick = async () => {
    if (!recentAutoSavedData) return;
    const { body, title } = recentAutoSavedData;
    const draft = {
      body,
      title,
      short_description:
        draftPostData.short_description || extractTextFromMarkdown(body) || "",
      thumbnail:
        draftPostData.thumbnail || extractFirstImageFromText(body) || "",
      url_slug: draftPostData.url_slug || slugify(title),
    };

    setDraftPostData(draft);
  };

  const onUpload = async () => {
    if (!isValid) {
      toast.error("게스트 모드에서는 서버에 반영되지 않습니다.");
    }
    setIsUploading(true);
    if (!postId) {
      const { data } = await createPost(draftPostData);

      if (data?.url_slug) {
        router.push(`/post/${data.url_slug}`);
        setIsUploaded(true);
        setTimeout(() => toast.success("게시글을 작성하였습니다."), 200);
      } else {
        toast.error("게시글이 업로드되지 않았습니다.");
      }
    } else {
      const { data } = await updatePost(postId, draftPostData);
      if (data) {
        toast.success("게시글을 업로드하였습니다.");
        setIsUploaded(true);
        setPostsPending(true);
      } else {
        toast.error("게시글이 업데이트되지 않았습니다.");
      }
    }
    setIsUploading(false);
  };

  return (
    <Dialog>
      <DialogTrigger onClick={onClick} asChild>
        <div
          role="button"
          className="text-gray-600 dark:text-indigo-300 px-2 rounded-md transition-colors duration-200 hover:bg-sky-300/30"
        >
          업로드
        </div>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md bg-indigo-50 dark:bg-[#1a1a1a] text-indigo-800 dark:text-indigo-100"
        aria-describedby="uploading-dialog-trigger"
      >
        <DialogHeader>
          <DialogTitle>업로드</DialogTitle>
          <DialogDescription>수정할 정보를 입력하세요.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <PostUploadingForm />
          </div>
        </div>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={onUpload}>
              업로드 하기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
