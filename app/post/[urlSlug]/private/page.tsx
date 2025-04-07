export const dynamic = "force-dynamic";
import PostPageRenderer from "@/components/post/page/page-renderer";

interface PageProps {
  params: Promise<{
    urlSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  return <PostPageRenderer params={params} />;
}
