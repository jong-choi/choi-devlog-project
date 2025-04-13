import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { useShallow } from "zustand/react/shallow";

export default function SubcategoryCategorySelect({
  value,
  setValue,
  className,
}: {
  value: string;
  setValue: (value: string) => void;
  className?: string;
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
      <SelectTrigger id="category-select" className={cn("w-full", className)}>
        <SelectValue placeholder="주제를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {categories ? (
          categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))
        ) : (
          <></>
        )}
      </SelectContent>
    </Select>
  );
}
