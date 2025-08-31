"use client";
import { toast } from "sonner";
import DeleteForm from "@/components/form/delete-form";
import { Category } from "@/types/post";
import { softDeleteCategory } from "@/app/post/actions";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import notSavedToast from "@/utils/not-saved-toast";
import { useAuthStore } from "@/providers/auth-provider";
import { DialogDescription } from "@ui/dialog";

export default function CategoryDeleteForm({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const { setCategoriesPending } = useSidebarStore(
    useShallow((state) => ({
      setCategoriesPending: state.setCategoriesPending,
    }))
  );
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
      const { error } = await softDeleteCategory(category.id);
      if (error) {
        toast.error("삭제 실패", { description: error.message });
      } else {
        toast.success("주제가 삭제되었습니다.");
        setCategoriesPending(true);
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
      <DialogDescription>{category.name}</DialogDescription>
      <DeleteForm onConfirm={handleDelete} onClose={onClose} entityLabel={category.name} />
    </div>
  );
}
