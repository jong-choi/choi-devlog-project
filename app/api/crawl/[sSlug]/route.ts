import { VelogAPIResponse } from "@/app/api/crawl/[sSlug]/types";
import createCrawledPost from "@/app/api/crawl/[sSlug]/utils/createCrawledPost";
import createCrawledSubcategory from "@/app/api/crawl/[sSlug]/utils/createCrawledSubcategory";

import fetchSeries from "@/app/api/crawl/[sSlug]/utils/fetchSeries";
import getImageUrls from "@/app/api/crawl/[sSlug]/utils/getImageUrls";
import uploadImageByUrl from "@/app/api/crawl/[sSlug]/utils/uploadImageByUrl";
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

  try {
    // velog api를 이용하여 "시리즈" 게시글을을 불러오는 단계이다.
    const seriesData: VelogAPIResponse = await fetchSeries(sSlug);
    const series = seriesData.data?.series || null;

    // crawling한 데이터에서 series를 subcategory로 삽입하는 단계
    const subcategoryId = await createCrawledSubcategory(sSlug, series);

    // 게시글들을 table에 삽입하는 단계
    await createCrawledPost(series, subcategoryId);

    // regex로 게시글들에서 이미지들의 url들을 불러오는 단계이다. /post/sdfsd/image.png 와 같은 형식이다.
    const imageUrls: Array<string> = getImageUrls(seriesData);

    // 이미지들의 url을 통해 업로드를 하는 단계이다.
    const uploadResults = await Promise.all(
      imageUrls.map((url) => uploadImageByUrl(url))
    );

    const data = uploadResults;

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
