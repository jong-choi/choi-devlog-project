import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
