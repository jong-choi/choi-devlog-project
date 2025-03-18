import { VelogPost } from "@/app/api/crawl/[sSlug]/types";
import createCrawledAISummary from "@/app/api/crawl/[sSlug]/utils/createCrawledAISummary";
import { createPost } from "@/app/post/actions";

export default async function createCrawledPost(
  series: {
    id: string;
    name: string;
    series_posts: {
      id: string;
      index: number;
      post: VelogPost;
      __typename: string;
    }[];
    __typename: string;
  } | null,
  subcategoryId: string
) {
  if (!subcategoryId || !series) return;

  await Promise.all(
    series.series_posts.map(async (data) => {
      const { post } = data;
      const {
        id,
        title,
        released_at,
        updated_at,
        body,
        short_description,
        thumbnail,
        url_slug,
      } = post;

      const parsedBody = body.replace(
        /https:\/\/velog\.velcdn\.com\/images\/bluecoolgod80\//g,
        "https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image/"
      );

      const payload = {
        velog_id: id,
        released_at,
        title,
        updated_at,
        body: parsedBody,
        short_description,
        thumbnail,
        url_slug,
        subcategory_id: subcategoryId,
      };

      const postData = (await createPost(payload)).data;

      return await createCrawledAISummary({
        post_id: postData?.id,
        title: postData?.title,
        body: postData?.body || "",
      });
    })
  );
}
