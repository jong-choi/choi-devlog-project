import { VelogPost } from "@/app/api/crawl/[sSlug]/types";
import { createClient } from "@/utils/supabase/server";

interface Series {
  id: string;
  name: string;
  series_posts: {
    id: string;
    index: number;
    post: VelogPost;
    __typename: string;
  }[];
  __typename: string;
}

export default async function createCrawledSubcategory(
  sSlug: string,
  series: Series | null
): Promise<string> {
  let subcategoryId = "";
  if (!series) return subcategoryId;
  const subcategory = {
    velog_id: series?.id,
    name: series?.name,
    url_slug: sSlug,
  };

  const supabase = await createClient();

  // 같은 velog_id를 가진 객체가 DB에 있는지 확인
  let isExisting = false;
  if (subcategory.velog_id) {
    const { data: existing } = await supabase
      .from("subcategories")
      .select("id")
      .eq("velog_id", subcategory.velog_id)
      .limit(1)
      .single();

    if (existing) {
      subcategoryId = existing.id;
      isExisting = true;
    }
  }

  // 같은 velog_id를 가진 객체가 없으면 삽입
  if (!isExisting) {
    const { data } = await supabase
      .from("subcategories") // 테이블 이름
      .insert(subcategory)
      .select()
      .limit(1)
      .single();

    if (data) {
      subcategoryId = data.id as string;
    }
  }
  return subcategoryId;
}
