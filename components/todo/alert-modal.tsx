import { Button } from "@ui/button";
import { Modal } from "@ui/modal";

interface AlertModalProps {
  disabled: boolean;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  disabled,
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      title="삭제하시겠습니까?"
      description="삭제 시 복구가 불가능합니다."
      isOpen={open}
      onClose={onClose}
    >
      <div className="flex items-center justify-end gap-x-2">
        <Button onClick={onClose} disabled={disabled} variant="outline">
          취소
        </Button>
        <Button onClick={onConfirm} disabled={disabled} variant="destructive">
          삭제
        </Button>
      </div>
    </Modal>
  );
};

export { AlertModal };
