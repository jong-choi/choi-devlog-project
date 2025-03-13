import { VelogAPIResponse } from "@/app/api/crawl/[sSlug]/types";
import fetchPost from "@/app/api/crawl/[sSlug]/utils/fetchPost";
import getImageUrls from "@/app/api/crawl/[sSlug]/utils/getImageUrls";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { sSlug: string } }
) {
  // sSlug는 velog "시리즈"의 url slug를 의미한다.
  const { sSlug } = params;

  if (!sSlug) {
    return NextResponse.json({ error: "Missing sSlug" }, { status: 400 });
  }

  try {
    // velog api를 이용하여 "시리즈" 게시글을을 불러오는 단계이다.
    const postData: VelogAPIResponse = await fetchPost(
      sSlug || "CS공부-디자인-패턴"
    );

    // regex로 게시글들에서 이미지들의 url들을 불러오는 단계이다. /post/sdfsd/image.png 와 같은 형식이다.
    const imageUrls: Array<string> = getImageUrls(postData);

    const data = imageUrls;
    if (!data) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
