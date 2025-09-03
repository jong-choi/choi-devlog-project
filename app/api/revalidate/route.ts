import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

type RevalidateRequestBody = {
  tags: string | string[];
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 로그인 된 유저만 사용 가능
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RevalidateRequestBody = await request.json();
    const { tags } = body;

    if (!tags) {
      return Response.json(
        { error: "tags parameter is required" },
        { status: 400 },
      );
    }

    const tagsArray = Array.isArray(tags) ? tags : [tags];

    if (tagsArray.length === 0) {
      return Response.json(
        { error: "At least one tag is required" },
        { status: 400 },
      );
    }

    const revalidatedTags: string[] = [];

    // 입력받은 태그들을 revalidate
    for (const tag of tagsArray) {
      try {
        revalidateTag(tag);
        revalidatedTags.push(tag);
      } catch (error) {
        console.error(`Failed to revalidate tag: ${tag}`, error);
      }
    }

    return Response.json({
      success: true,
      revalidatedTags,
      message: `${revalidatedTags.length}개의 캐시 태그를 성공적으로 재검증했습니다`,
    });
  } catch (error) {
    console.error("Revalidate API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
