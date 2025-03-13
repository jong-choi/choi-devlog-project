// ✅ 이미지 다운로드 함수
export default async function fetchImage(
  imageUrl: string
): Promise<Buffer | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer(); // 이미지 데이터를 Buffer로 변환
    return Buffer.from(imageBuffer);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}
