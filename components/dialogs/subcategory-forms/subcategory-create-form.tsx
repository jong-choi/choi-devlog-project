import { createSubcategory } from "@/app/post/actions";
import SubcategoryCategorySelect from "@/components/dialogs/subcategory-forms/subcategory-category-select";
import { useAuthStore } from "@/providers/auth-provider";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import notSavedToast from "@/utils/not-saved-toast";
import { slugify } from "@/utils/uploadingUtils";
import { GlassButton } from "@ui/glass-button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

type SubcategoryCreateFormProps = {
  onClose: () => void;
  defaultCategoryId: string;
};

export default function SubcategoryCreateForm({
  onClose,
  defaultCategoryId,
}: SubcategoryCreateFormProps) {
  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>(defaultCategoryId);
  const [urlSlug, setUrlSlug] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { isValid } = useAuthStore(
    useShallow((state) => ({
      isValid: state.isValid,
    }))
  );
  const { setCategoriesPending } = useSidebarStore(
    useShallow((state) => ({
      setCategoriesPending: state.setCategoriesPending,
    }))
  );

  const payload = {
    name: name,
    url_slug: slugify(urlSlug) || slugify(name),
    category_id: categoryId,
  };
  const isComplete = Object.values(payload).every(Boolean);

  const handleCreate = async () => {
    setIsSaving(true);
    if (!isValid) {
      notSavedToast();
      onClose();
      return setIsSaving(false);
    }
    try {
      const { data, error } = await createSubcategory(payload);
      if (data) {
        setCategoriesPending(true);
        toast.success("새 주제가 생성되었습니다.");
      } else if (error) {
        toast.error("주제 생성 실패", { description: error.message });
      }
    } catch (e) {
      toast.error("주제 생성에 실패하였습니다.");
      console.error(e);
    }
    onClose();
    setIsSaving(false);
  };

  return (
    <div className="grid gap-2">
      <div className="grid gap-2">
        <div className="grid grid-cols-7 items-center gap-1">
          <Label htmlFor="category-select">분류</Label>
          <SubcategoryCategorySelect
            value={categoryId}
            setValue={setCategoryId}
            className="col-span-6 h-8"
          />
        </div>
        <div className="grid grid-cols-7 items-center gap-1">
          <Label htmlFor="name-input">이름</Label>
          <Input
            id="name-input"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="이름"
            className="col-span-6 h-8"
          />
        </div>
        <div className="grid grid-cols-7 items-center gap-1">
          <Label htmlFor="url-input">URL</Label>
          <Input
            id="url-input"
            value={urlSlug}
            onChange={(e) => setUrlSlug(e.currentTarget.value)}
            placeholder={payload.url_slug}
            className="col-span-6 h-8"
          />
        </div>
        <GlassButton
          className="py-1"
          disabled={!isComplete}
          loading={isSaving}
          onClick={handleCreate}
        >
          생성
        </GlassButton>
      </div>
    </div>
  );
}
