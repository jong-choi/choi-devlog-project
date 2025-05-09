import { createPost } from "@/app/post/actions";
import { useAuthStore } from "@/providers/auth-provider";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import notSavedToast from "@/utils/not-saved-toast";
import { slugify } from "@/utils/uploadingUtils";
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
import { useRouter } from "next/navigation";

import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

export default function PostCreateForm({ onClose }: { onClose: () => void }) {
  const { selectedSubcategoryId, setPostsPending } = useSidebarStore(
    useShallow((state) => ({
      selectedSubcategoryId: state.selectedSubcategoryId,
      setPostsPending: state.setPostsPending,
    }))
  );
  const { isEditMode, setIsEditMode, setIsMarkdown } = useLayoutStore(
    useShallow((state) => ({
      isEditMode: state.isEditMode,
      setIsEditMode: state.setIsEditMode,
      setIsMarkdown: state.setIsMarkdown,
    }))
  );
  const [title, setTitle] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<boolean>(true);
  const [urlSlug, setUrlSlug] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>(
    selectedSubcategoryId || ""
  );
  const router = useRouter();

  const { isValid } = useAuthStore(
    useShallow((state) => ({
      isValid: state.isValid,
    }))
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const payload = {
    title: title,
    url_slug: slugify(urlSlug) || slugify(title) || "new",
    is_private: isPrivate,
    subcategory_id: subcategoryId,
  };
  const isChanged = title && subcategoryId;

  const handleUpdate = async () => {
    setIsSaving(true);
    if (!isValid) {
      notSavedToast();
      onClose();
      return setIsSaving(false);
    }
    try {
      const { data, error } = await createPost(payload);
      if (data) {
        router.push(`/post/${data.url_slug}`);
        setPostsPending(true);
        if (!isEditMode) {
          setIsEditMode(true);
          setIsMarkdown(true);
        }
        toast.success("게시글이 생성되었습니다.");
      } else if (error) {
        toast.error("게시글 생성 실패", { description: error.message });
      }
    } catch (e) {
      toast.error("게시글 생성에 실패하였습니다.");
      console.error(e);
    }
    onClose();
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex gap-2 items-center">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            defaultValue={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="grid flex-1 gap-2">
        <Label htmlFor="url-slug">URL 주소</Label>
        <div className="flex items-center">
          <div className="pl-2">/</div>
          <Input
            id="url-slug"
            className="-ml-3"
            defaultValue={urlSlug}
            placeholder={payload.url_slug}
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
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="is-praivate"
            checked={!isPrivate}
            onCheckedChange={(checked) => setIsPrivate(!checked)}
          />
          <Label htmlFor="is-praivate-mode">
            {isPrivate ? "비공개됨" : "공개됨"}
          </Label>
        </div>
        <GlassButton
          className="py-1"
          loading={isSaving}
          onClick={handleUpdate}
          disabled={!isChanged}
        >
          생성하기
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
        <SelectValue placeholder="시리즈를 선택하세요" />
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
