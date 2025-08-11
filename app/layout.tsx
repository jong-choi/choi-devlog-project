export const revalidate = 31536000;

import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/providers/auth-store-provider";
import { AuthStoreProvider } from "@/providers/auth-provider";
import { Toaster } from "@ui/sonner";
import { RouteLoadingProvider } from "@/providers/route-loading-provider";
import { RouteLoader } from "@ui/route-loader";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://blog.jongchoi.com"
  ),
  title: {
    default: "Scribbly",
    template: "Scribbly | %s",
  },
  description: "프론트엔드 개발자의 휘갈긴 기술 블로그 Scribbly",
  keywords: ["Next.js", "React", "Supabase", "프론트엔드"],
  authors: [{ name: "jong-Choi", url: "/" }],
  creator: "jong-Choi",
  publisher: "jong-Choi",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Scribbly",
    description: "프론트엔드 개발자의 휘갈긴 기술 블로그 Scribbly",
    url: "/",
    siteName: "Scribbly - 기술 블로그",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Scribbly 블로그 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko-KR">
      <body
        className={`antialiased h-screen flex flex-col bg-background text-color-base font-sans scrollbar-hidden`}
      >
        <div className="css-background z-0">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <AuthStoreProvider>
          <RouteLoadingProvider>
            <AuthProvider />
            <div className="z-10">
              <RouteLoader />
              {children}
            </div>
          </RouteLoadingProvider>
        </AuthStoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
