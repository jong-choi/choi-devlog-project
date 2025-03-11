import { getTodosByUserId } from "@/app/(example)/example/[userId]/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // searchParams에서 userId를 가져온다.
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // getTodosByUserId 서버 액션을 이용하여 데이터를 가져온다.
    const todos = await getTodosByUserId(userId);
    return NextResponse.json(todos);
  } catch (_e) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}
