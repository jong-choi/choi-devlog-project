"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GlassButton } from "@ui/glass-button";
import { Input } from "@ui/input";
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
  const [confirmText, setConfirmText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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
    setIsSaving(true);
    if (!isValid) {
      notSavedToast();
      onClose();
      return setIsSaving(false);
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
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <DialogDescription>{category.name}</DialogDescription>
      <div className="text-sm">
        삭제하시려면 <strong>지금 삭제</strong> 라고 입력하세요.
      </div>
      <div className="grid grid-cols-5 gap-2">
        <Input
          className="col-span-4"
          placeholder="지금 삭제"
          value={confirmText}
          onChange={(e) => setConfirmText(e.currentTarget.value)}
        />
        <GlassButton
          className="col-span-1"
          variant="danger"
          disabled={confirmText !== "지금 삭제"}
          loading={isSaving}
          onClick={handleDelete}
        >
          삭제
        </GlassButton>
      </div>
    </div>
  );
}
