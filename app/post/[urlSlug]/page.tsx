import { Metadata } from "next";
import RedirectTo from "@ui/redirect-to";
import { getPostByUrlSlug } from "@/app/post/fetchers";
import PostPageRenderer from "@/components/post/page/page-renderer";

export const dynamic = "force-static";

interface PageProps {
  params: Promise<{
    urlSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { urlSlug } = await params;
  const result = await getPostByUrlSlug({
    urlSlug: decodeURIComponent(urlSlug),
  });
  const post = result.data;

  return {
    title: post?.title ?? "게시글",
    description: post?.short_description ?? "Scribbly 블로그 게시글",
  };
}

export default async function Page({ params }: PageProps) {
  const { urlSlug } = await params;
  const result = await getPostByUrlSlug({
    urlSlug: decodeURIComponent(urlSlug),
  });
  const { data } = result;

  if (!data || data.is_private) {
    return <RedirectTo to={`/post/${urlSlug}/private`} />;
  }

  return <PostPageRenderer data={data} urlSlug={decodeURIComponent(urlSlug)} />;
}
