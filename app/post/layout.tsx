import { LayoutStoreProvider } from "@/providers/layout-store-provider";

interface PostRootLayoutProps {
  children: React.ReactNode;
}

export default async function PostRootLayout({
  children,
}: PostRootLayoutProps) {
  return <LayoutStoreProvider>{children}</LayoutStoreProvider>;
}
