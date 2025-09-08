import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Switch } from "@ui/switch";
import { Textarea } from "@ui/textarea";
import { CategorySelectScrollable } from "@/components/post/post-controller/post-scrollable-select";
import { useAutosave } from "@/providers/autosave-store-provider";

export default function PostUploadingForm() {
  const { setDraftPostData, draftPostData } = useAutosave(
    useShallow((state) => ({
      setDraftPostData: state.setDraftPostData,
      draftPostData: state.draftPostData,
    })),
  );
  const releasedAt = draftPostData.released_at;
  const isPrivate = draftPostData.is_private;

  const onPrivateChange = (checked: boolean) => {
    const isPrivate = !checked;
    setDraftPostData({ is_private: isPrivate });
    if (checked && !releasedAt) {
      setDraftPostData({ released_at: new Date().toISOString() });
    }
  };

  const [urlSlug, setUrlSlug] = useState<string>(draftPostData.url_slug);
  useEffect(() => {
    setDraftPostData({ url_slug: urlSlug });
  }, [setDraftPostData, urlSlug]);

  const [shortDesc, setShortDesc] = useState<string>(
    draftPostData.short_description || "",
  );
  useEffect(() => {
    setDraftPostData({ short_description: shortDesc });
  }, [setDraftPostData, shortDesc]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid flex-1 gap-2">
        <Label htmlFor="url-slug">URL 주소</Label>
        <div className="flex items-center">
          <div className="pl-2">/</div>
          <Input
            id="url-slug"
            className="-ml-3"
            defaultValue={draftPostData.url_slug}
            onChange={(e) => setUrlSlug(e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="grid flex-1 gap-2">
        <Label htmlFor="subcategory-select">카테고리 선택</Label>
        <CategorySelectScrollable />
      </div>
      <div className="grid flex-1 gap-2">
        <Label htmlFor="short-description">요약</Label>
        <Textarea
          id="short-description"
          defaultValue={draftPostData.short_description || ""}
          onChange={(e) => setShortDesc(e.currentTarget.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is-private"
          checked={!draftPostData.is_private}
          onCheckedChange={onPrivateChange}
        />
        <Label htmlFor="is-private-mode">
          {!isPrivate ? "공개" : "비공개"}
        </Label>
      </div>
    </div>
  );
}
