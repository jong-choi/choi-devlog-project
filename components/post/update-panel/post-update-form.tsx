import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Post } from "@/types/post";
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
import { Textarea } from "@ui/textarea";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

export default function PostUpdateForm({ post }: { post: Post }) {
  const [isPrivate, setIsPrivate] = useState<boolean>(post.is_private || false);
  const [urlSlug, setUrlSlug] = useState<string>(post.url_slug);
  const [shortDesc, setShortDesc] = useState<string>(
    post.short_description || ""
  );
  const [subcategoryId, setSubcategoryId] = useState<string>(
    post.subcategory_id || ""
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid flex-1 gap-2">
        <Label htmlFor="url-slug">URL 주소</Label>
        <div className="flex items-center">
          <div className="pl-2">/</div>
          <Input
            id="url-slug"
            className="-ml-3"
            defaultValue={urlSlug}
            onChange={(e) => setUrlSlug(e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="grid flex-1 gap-2">
        <Label htmlFor="subcategory-select">카테고리 선택</Label>
        <CategorySelectScrollable
          value={subcategoryId}
          setValue={setSubcategoryId}
        />
      </div>
      <div className="grid flex-1 gap-2">
        <Label htmlFor="short-description">요약</Label>
        <Textarea
          id="short-description"
          defaultValue={shortDesc}
          onChange={(e) => setShortDesc(e.currentTarget.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is-praivate"
          checked={!isPrivate}
          onCheckedChange={(checked) => setIsPrivate(!checked)}
        />
        <Label htmlFor="is-praivate-mode">
          {isPrivate ? "비공개" : "공개"}
        </Label>
      </div>
    </div>
  );
}

function CategorySelectScrollable({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const categories = useSidebarStore(useShallow((state) => state.categories));

  return (
    <Select
      defaultValue={value}
      onValueChange={(value) => {
        setValue(value);
      }}
    >
      <SelectTrigger id="subcategory-select" className="w-[280px]">
        <SelectValue placeholder="서브카테고리를 선택하세요" />
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
