import { updatePost } from "@/app/post/actions";
import { useAuthStore } from "@/providers/auth-provider";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Post } from "@/types/post";
import notSavedToast from "@/utils/not-saved-toast";
import { GlassButton } from "@ui/glass-button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Switch } from "@ui/switch";
import { Textarea } from "@ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

export default function PostUpdateForm({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const [isPrivate, setIsPrivate] = useState<boolean>(post.is_private || false);
  const [urlSlug, setUrlSlug] = useState<string>(post.url_slug);
  const [shortDesc, setShortDesc] = useState<string>(
    post.short_description || ""
  );
  const [subcategoryId, setSubcategoryId] = useState<string>(
    post.subcategory_id || ""
  );

  const { session } = useAuthStore(
    useShallow((state) => ({
      session: state.session,
    }))
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isChanged =
    isPrivate !== (post.is_private || false) ||
    urlSlug !== post.url_slug ||
    shortDesc !== (post.short_description || "") ||
    subcategoryId !== (post.subcategory_id || "");

  const handleUpdate = async () => {
    setIsSaving(true);
    if (!session) {
      notSavedToast();
      onClose();
      return setIsSaving(false);
    }
    try {
      const { data, error } = await updatePost(post.id, {
        url_slug: urlSlug,
        short_description: shortDesc,
        is_private: isPrivate,
        subcategory_id: subcategoryId,
      });
      if (data) {
        toast.success("게시글이 수정되었습니다.");
      } else if (error) {
        toast.error("게시글 수정 실패", { description: error.message });
      }
    } catch (e) {
      toast.error("게시글 수정에 실패하였습니다.");
      console.error(e);
    }
    onClose();
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="grid flex-1 gap-2">
        <Label htmlFor="url-slug">URL 주소</Label>
        <div className="flex items-center">
          <div className="pl-2">/</div>
          <Input
            id="url-slug"
            className="-ml-3"
            defaultValue={urlSlug}
            onChange={(e) => setUrlSlug(e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="grid flex-1 gap-2">
        <Label htmlFor="subcategory-select">시리즈</Label>
        <SubcategorySelectScrollable
          value={subcategoryId}
          setValue={setSubcategoryId}
        />
      </div>
      <div className="grid flex-1 gap-2">
        <Label htmlFor="short-description">요약</Label>
        <Textarea
          id="short-description"
          defaultValue={shortDesc}
          onChange={(e) => setShortDesc(e.currentTarget.value)}
          className="h-24"
        />
      </div>
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="is-praivate"
            checked={!isPrivate}
            onCheckedChange={(checked) => setIsPrivate(!checked)}
          />
          <Label htmlFor="is-praivate-mode">
            {isPrivate ? "비공개" : "공개"}
          </Label>
        </div>
        <GlassButton
          className="py-1"
          disabled={!isChanged}
          loading={isSaving}
          onClick={handleUpdate}
        >
          업데이트
        </GlassButton>
      </div>
    </div>
  );
}

function SubcategorySelectScrollable({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const { categories } = useSidebarStore(
    useShallow((state) => ({
      categories: state.categories,
    }))
  );

  return (
    <Select
      defaultValue={value}
      onValueChange={(value) => {
        setValue(value);
      }}
    >
      <SelectTrigger id="subcategory-select" className="w-full">
        <SelectValue placeholder="서브카테고리를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {categories ? (
          categories.map((category) => (
            <SelectGroup key={category.id}>
              <SelectLabel>{category.name}</SelectLabel>
              {category.subcategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))
        ) : (
          <></>
        )}
      </SelectContent>
    </Select>
  );
}
