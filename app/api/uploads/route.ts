import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import sharp from "sharp";

export async function POST(req: Request) {
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
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const filePath = `posts/${crypto.randomUUID()}-${file.name}`;

    const buffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(buffer);

    const compressedImage = await sharp(inputBuffer)
      .webp({
        quality: 80,
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
      })
      .toBuffer();

    const { error } = await supabase.storage
      .from("image")
      .upload(filePath, compressedImage, { contentType: "image/jpeg" });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const imageUrl = supabase.storage.from("image").getPublicUrl(filePath)
      .data.publicUrl;

    return NextResponse.json({ url: imageUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
