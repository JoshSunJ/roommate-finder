import type { NextConfig } from "next";

function photoRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const publicBaseUrl = process.env.PHOTO_PUBLIC_BASE_URL?.trim();
  if (!publicBaseUrl) return [];

  const url = new URL(publicBaseUrl);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("PHOTO_PUBLIC_BASE_URL must use HTTPS in production.");
  }

  const basePath = url.pathname.replace(/\/$/, "");
  return [{
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port,
    pathname: `${basePath}/listings/**`,
    search: "",
  }];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: photoRemotePatterns(),
    maximumRedirects: 0,
  },
};

export default nextConfig;
