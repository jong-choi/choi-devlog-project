export const dynamic = "force-dynamic";

import { getPostByUrlSlug } from "@/app/post/fetchers";
import PostPageRenderer from "@/components/post/page/page-renderer";
import RedirectTo from "@ui/redirect-to";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    urlSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { urlSlug } = await params;
  const cookieStore = await cookies();
  const result = await getPostByUrlSlug(
    {
      urlSlug: decodeURIComponent(urlSlug),
    },
    cookieStore
  );

  const { data } = result;

  if (!data) {
    return <RedirectTo to={`/post/${urlSlug}/private`} />;
  } else if (!data.is_private) {
    return redirect(`/post/${urlSlug}`);
  }

  return <PostPageRenderer data={data} />;
}
