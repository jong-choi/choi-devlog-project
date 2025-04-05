import { Plus } from "lucide-react";

export default function CreateNewTrigger({ title }: { title?: string }) {
  return (
    <div className="flex items-center text-xs cursor-pointer text-color-muted hover:text-color-base text-shadow ">
      <Plus className="w-4 h-4" />
      {title && <div className="pr-1">{title}</div>}
    </div>
  );
}
