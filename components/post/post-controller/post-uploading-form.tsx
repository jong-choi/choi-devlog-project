import { CategorySelectScrollable } from "@/components/post/post-controller/post-scrollable-select";
import { useAutosave } from "@/providers/autosave-store-provider";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Switch } from "@ui/switch";
import { Textarea } from "@ui/textarea";
import { useEffect, useState } from "react";

export default function PostUploadingForm() {
  const setDraftPostData = useAutosave((state) => state.setDraftPostData);
  const draftPostData = useAutosave((state) => state.draftPostData);
  const [isPrivate, setIsPrivate] = useState<boolean>(
    draftPostData.is_private || false
  );
  useEffect(() => {
    setDraftPostData({ is_private: isPrivate });
  }, [setDraftPostData, isPrivate]);

  const [urlSlug, setUrlSlug] = useState<string>(draftPostData.url_slug);
  useEffect(() => {
    setDraftPostData({ url_slug: urlSlug });
  }, [setDraftPostData, urlSlug]);

  const [shortDesc, setShortDesc] = useState<string>(
    draftPostData.short_description || ""
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
