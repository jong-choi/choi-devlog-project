import { VelogAPIResponse } from "@/app/api/crawl/[sSlug]/types";

export default function getImageUrls(seriesData: VelogAPIResponse): string[] {
  if (!seriesData?.data?.series?.series_posts) {
    return [];
  }

  const imageUrls: string[] = [];

  seriesData.data.series.series_posts.forEach((seriesPost) => {
    const body = seriesPost.post.body;

    if (body) {
      // // 정규 표현식을 사용하여 이미지 URL 추출 (post/.../.../png 형태로 변경)
      // png 말고 다른 확장자도 추가하도록 수정.
      const regex =
        /\(https:\/\/velog\.velcdn\.com\/images\/bluecoolgod80\/(post\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.(png|jpg|jpeg|gif|webp))\)/g;
      let match;

      while ((match = regex.exec(body)) !== null) {
        imageUrls.push(match[1]); // `post/.../.../png` 형태로 추가
      }
    }
  });

  return imageUrls;
}
