import { toast } from "sonner";

export default function notSavedToast() {
  return toast.warning("변경사항이 저장되지 않았습니다.", {
    description: "게스트 모드에서는 변경사항이 저장되지 않습니다.",
  });
}
