import { NextRequest, NextResponse } from "next/server";
import { getPostByUrlSlug } from "@/app/post/fetchers";
import { createClient } from "@/utils/supabase/server";

const VISITOR_ID_COOKIE_NAME = "visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type AnalyticsPayload = {
  path: string;
  search?: string | null;
  params?: string | null;
};

export async function POST(request: NextRequest) {
  let body: AnalyticsPayload;

  try {
    body = await request.json();
  } catch (error) {
    console.error("analytics invalid body:", error);
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { path, search = null, params = null } = body;

  if (!path?.trim()) {
    console.error("analytics path is required:", body);
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  try {
    const referer = request.headers.get("referer");
    const ua = request.headers.get("user-agent");
    const hasVisitorCookie = !!request.cookies.get(VISITOR_ID_COOKIE_NAME)
      ?.value;
    const visitorId =
      request.cookies.get(VISITOR_ID_COOKIE_NAME)?.value ?? crypto.randomUUID();

    const pathSegments = path.split("/").filter(Boolean);
    const isPublicPostPath =
      pathSegments.length === 2 && pathSegments[0] === "post";
    const postUrlSlug = isPublicPostPath
      ? decodeURIComponent(pathSegments[1])
      : null;

    let postId: string | null = null;
    if (postUrlSlug) {
      const postResult = await getPostByUrlSlug({ urlSlug: postUrlSlug });
      if (postResult.error) {
        console.error(
          "analytics post lookup failed:",
          postResult.error.message,
        );
      }
      postId = postResult.data?.id ?? null;
    }

    const supabase = await createClient(undefined, true);

    const { error } = await supabase.from("analytics_events").insert({
      visitor_id: visitorId,
      path,
      search,
      params,
      referer,
      ua,
      post_id: postId,
    });

    if (error) {
      console.error("analytics insert failed:", error.message);
      return NextResponse.json({ error: "insert failed" }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });

    if (!hasVisitorCookie) {
      response.cookies.set({
        name: VISITOR_ID_COOKIE_NAME,
        value: visitorId,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: VISITOR_COOKIE_MAX_AGE,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("analytics POST unexpected error:", error);
    return NextResponse.json(
      { error: "analytics request failed" },
      { status: 500 },
    );
  }
}
