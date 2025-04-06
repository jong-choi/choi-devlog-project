import SidebarHydrator from "@/components/post/sidebar/sidebar-hydrator";

interface PostDetailLayoutProps {
  params: Promise<{
    urlSlug?: string;
  }>;

  children: React.ReactNode;
}

export default async function PostDetailLayout({
  params,
  children,
}: PostDetailLayoutProps) {
  const urlSlug = (await params).urlSlug || "";

  return (
    <>
      <SidebarHydrator urlSlug={urlSlug} />
      {children}
    </>
  );
}
