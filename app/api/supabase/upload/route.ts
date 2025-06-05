import fetchImage from "@/app/api/supabase/upload/utils/fetchImage";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// 요청 바디 타입 정의
interface UploadRequestBody {
  imageUrl: string;
}

// velog의 이미지 주소를 받아서 supabase 스토리지에 업로드하는 API
export async function POST(req: NextRequest) {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);
  const user = await supabase.auth.getUser();
  if (!user.data) {
    console.error("로그인되지 않은 사용자:");
    return NextResponse.json(
      { error: "사용자 정보 불러오기 실패" },
      { status: 500 }
    );
  }
  try {
    // 요청에서 JSON 데이터 파싱
    const body: UploadRequestBody = await req.json();
    const { imageUrl } = body;

    // imageUrl이 없으면 400 에러 반환
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl in request body" },
        { status: 400 }
      );
    }

    // Velog 이미지 기본 URL
    const baseUrl = "https://velog.velcdn.com/images/bluecoolgod80/";
    const fullImageUrl = `${baseUrl}${imageUrl}`;

    // 이미지 다운로드
    const imageBuffer = await fetchImage(fullImageUrl);

    if (!imageBuffer) {
      return NextResponse.json(
        { error: "Failed to download image" },
        { status: 500 }
      );
    }

    // Supabase에 이미지 업로드
    const { data, error } = await supabase.storage
      .from("image") // Supabase 버킷 이름
      .upload(imageUrl, imageBuffer, {
        contentType: "image/png", // 이미지 타입 설정
        cacheControl: "3600",
        upsert: true, // 같은 파일명이 있을 경우 덮어쓰지 않음
      });

    if (error) {
      console.error("Error handling request:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // 업로드된 이미지의 공개 URL 생성

    const publicUrl = supabase.storage.from("image").getPublicUrl(imageUrl)
      .data.publicUrl;

    // 최종 응답
    return NextResponse.json({
      originalUrl: fullImageUrl,
      fullPath: data.fullPath,
      uploadedUrl: publicUrl,
      uploaded: true,
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
