interface UploadResponse {
  originalUrl?: string; // 원본 Velog 이미지 URL
  uploadedUrl?: string; // Supabase에 업로드된 이미지 URL
  uploaded?: boolean; // 업로드 성공 여부
  error?: string; // 오류 메시지 (실패 시)
}

export default async function uploadImageByUrl(
  imageUrl: string
): Promise<UploadResponse> {
  try {
    const response = await fetch("http://localhost:3000/api/supabase/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    const data: UploadResponse = await response.json();
    return data; // 업로드된 이미지의 응답 데이터 반환
  } catch (error) {
    console.error("Error uploading image:", error);
    return { error: "Failed to upload image" };
  }
}
