import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wknphwqwtywjrfclmhjd.supabase.co",
      },
    ],
  },
};

export default nextConfig;
