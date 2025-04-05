import { createCategory } from "@/app/post/actions";
import { useAuthStore } from "@/providers/auth-provider";
import notSavedToast from "@/utils/not-saved-toast";
import { slugify } from "@/utils/uploadingUtils";
import { GlassButton } from "@ui/glass-button";
import { Input } from "@ui/input";
import { useState } from "react";
import { toast } from "sonner";

type CreateCategoryPanelProps = {
  onClose: () => void;
};

export default function CreateCategoryForm({
  onClose,
}: CreateCategoryPanelProps) {
  const [name, setName] = useState<string>("");
  const session = useAuthStore((state) => state.session);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isChanged = !!name;

  const handleCreate = async () => {
    setIsSaving(true);
    if (!session) {
      notSavedToast();
      onClose();
      return setIsSaving(false);
    }
    try {
      const { data, error } = await createCategory({
        name: name,
        url_slug: slugify(name),
      });
      if (data) {
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
      <p className="text-sm text-muted-foreground">새 주제</p>
      <div className="grid gap-2">
        <div className="grid grid-cols-4 items-center gap-1">
          <Input
            id="width"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="이름"
            className="col-span-3 h-8"
          />
          <GlassButton
            className="py-1"
            disabled={!isChanged}
            loading={isSaving}
            onClick={handleCreate}
          >
            생성
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
