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
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: photoRemotePatterns(),
    maximumRedirects: 0,
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(self)",
        },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ],
    }];
  },
};

export default nextConfig;
