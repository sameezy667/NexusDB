import type { NextConfig } from "next";

const getBackendUrl = () => {
  let url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
  if (!url.startsWith("http")) url = `https://${url}`;
  return url.replace(/\/$/, "");
};

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${getBackendUrl()}/api/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
