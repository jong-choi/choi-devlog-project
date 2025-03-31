import { AutosaveProvider } from "@/providers/autosave-store-provider";
import { Category } from "@/types/post";
import { Database } from "@/types/supabase";

interface PostMainWrapperProps {
  data: Database["public"]["Tables"]["posts"]["Row"] | null;
  subcategoryId: string;
  categoryData: Category[] | null;
  children?: React.ReactNode;
}

export default async function PostMainWrapper({
  data,
  subcategoryId,
  categoryData,
  children,
}: PostMainWrapperProps) {
  return (
    <AutosaveProvider
      initialState={{
        postId: data?.id,
        recentAutoSavedData: {
          title: data?.title || "",
          body: data?.body || "",
          timestamp: Date.now(),
        },
        draftPostData: {
          title: data?.title || "",
          body: data?.body || "",
          is_private: false,
          released_at: new Date().toISOString(),
          short_description: "",
          subcategory_id:
            data?.subcategory_id ||
            subcategoryId ||
            "524bdc55-932b-4ea5-b9f0-44fc05ec372f",
          thumbnail: data?.thumbnail || "",
          url_slug: data?.url_slug || "",
        },
        categoryData,
      }}
    >
      {children}
    </AutosaveProvider>
  );
}
