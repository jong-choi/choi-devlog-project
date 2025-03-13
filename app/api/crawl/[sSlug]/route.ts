import { VelogAPIResponse } from "@/app/api/crawl/[sSlug]/types";
import fetchPost from "@/app/api/crawl/[sSlug]/utils/fetchPost";
import getImageUrls from "@/app/api/crawl/[sSlug]/utils/getImageUrls";
import uploadImageByUrl from "@/app/api/crawl/[sSlug]/utils/uploadImageByUrl";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sSlug: string }> }
) {
  // sSlug는 velog "시리즈"의 url slug를 의미한다.
  const { sSlug } = await params;

  if (!sSlug) {
    return NextResponse.json({ error: "Missing sSlug" }, { status: 400 });
  }
  // return NextResponse.json(sSlug);
  try {
    // velog api를 이용하여 "시리즈" 게시글을을 불러오는 단계이다.
    const postData: VelogAPIResponse = await fetchPost(
      sSlug || "CS공부-디자인-패턴"
    );

    // regex로 게시글들에서 이미지들의 url들을 불러오는 단계이다. /post/sdfsd/image.png 와 같은 형식이다.
    const imageUrls: Array<string> = getImageUrls(postData);

    // 이미지들의 url을 통해 업로드를 하는 단계이다.
    const uploadResults = await Promise.all(
      imageUrls.map((url) => uploadImageByUrl(url))
    );
    const data = uploadResults;
    const series = postData.data?.series;
    if (series) {
      const subcategory = {
        velog_id: series?.id,
        name: series?.name,
        url_slug: sSlug,
      };
      // supabase의 public.subcategories 테이블에 subcategory를 추가하는 코드
      const supabase = await createClient(undefined, true);
      await supabase.auth.signOut(); // service-role을 수행하기 위해 로그아웃
      const { error } = await supabase
        .from("subcategories") // 테이블 이름
        .insert(subcategory);

      if (error) {
        throw new Error(`Failed to insert subcategory: ${error.message}`);
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
