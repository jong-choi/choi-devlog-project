import { VelogAPIResponse } from "@/app/api/crawl/[sSlug]/types";

export default function getImageUrls(postData: VelogAPIResponse): string[] {
  if (!postData?.data?.series?.series_posts) {
    return [];
  }

  const imageUrls: string[] = [];

  postData.data.series.series_posts.forEach((seriesPost) => {
    const body = seriesPost.post.body;

    if (body) {
      // 정규 표현식을 사용하여 이미지 URL 추출 (.png로 끝나는 모든 URL)
      const regex =
        /\(https:\/\/velog\.velcdn\.com\/images\/bluecoolgod80(\/post\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.png)\)/g;
      let match;

      while ((match = regex.exec(body)) !== null) {
        imageUrls.push(match[1]); // `/post/.../...png` 형태만 추가
      }
    }
  });

  return imageUrls;
}
