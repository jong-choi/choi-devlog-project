export const dynamic = "force-static";

import { getPostByUrlSlug } from "@/app/post/fetchers";
import PostPageRenderer from "@/components/post/page/page-renderer";
import RedirectTo from "@ui/redirect-to";

interface PageProps {
  params: Promise<{
    urlSlug: string;
  }>;
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

  return <PostPageRenderer data={data} />;
}
