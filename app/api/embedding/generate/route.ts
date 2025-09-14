import { NextResponse } from "next/server";
import { embeddings } from "@/app/api/embedding/_model/embeddings";

type EmbedRequest = {
  input?: string;
};

export async function POST(req: Request) {
  try {
    const { input }: EmbedRequest = await req.json();

    if (typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "'input'이 존재하지 않습니다." },
        { status: 400 },
      );
    }

    const vector = await embeddings.embedQuery(input);

    return NextResponse.json({
      vector,
    });
  } catch (error) {
    console.error("임베딩 에러", error);
    return NextResponse.json({ error: "임베딩 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
