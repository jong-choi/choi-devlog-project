import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    if (typeof postId !== "string" || postId.trim().length === 0) {
      return NextResponse.json(
        { error: "'postId' 파라미터가 필요합니다." },
        { status: 400 },
      );
    }

    // Service Role 권한으로 하드 삭제 수행
    const supabase = await createClient(undefined, true);
    const { data, error } = await supabase
      .from("post_chunks")
      .delete()
      .eq("post_id", postId)
      .select("id");

    if (error) {
      return NextResponse.json(
        { error: "삭제 중 오류가 발생했습니다.", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ postId, deletedCount: data?.length || 0 });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", details: (error as Error).message },
      { status: 500 },
    );
  }
}
