import { updateCategory } from "@/app/post/actions";
import { useAuthStore } from "@/providers/auth-provider";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category } from "@/types/post";
import notSavedToast from "@/utils/not-saved-toast";
import { DialogDescription } from "@ui/dialog";
import { GlassButton } from "@ui/glass-button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

type CategoryUpdateFormProps = {
  category: Category;
  onClose: () => void;
};

export default function CategoryUpdateForm({
  category,
  onClose,
}: CategoryUpdateFormProps) {
  const [name, setName] = useState<string>(category.name);
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

  const isChanged = category.name !== name;

  const handleCreate = async () => {
    setIsSaving(true);
    if (!isValid) {
      notSavedToast();
      onClose();
      return setIsSaving(false);
    }
    try {
      const { data, error } = await updateCategory(category.id, {
        name: name,
      });
      if (data) {
        setCategoriesPending(true);
        toast.success("주제가 수정되었습니다.");
      } else if (error) {
        toast.error("주제 수정 실패", { description: error.message });
      }
    } catch (e) {
      toast.error("주제 수정에 실패하였습니다.");
      console.error(e);
    }
    onClose();
    setIsSaving(false);
  };

  return (
    <div className="grid gap-2">
      <DialogDescription>{category.name}</DialogDescription>
      <div className="grid gap-2">
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
        <GlassButton
          className="py-1"
          disabled={!isChanged}
          loading={isSaving}
          onClick={handleCreate}
        >
          수정
        </GlassButton>
      </div>
    </div>
  );
}
