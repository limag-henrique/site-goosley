import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
function cspOrigin(value: string | undefined) {
  try {
    return value ? new URL(value).origin : "";
  } catch {
    return "";
  }
}
const facialApiOrigin = cspOrigin(process.env.NEXT_PUBLIC_FACIAL_SIMILARITY_API_ORIGIN);
const facialCspOrigin = facialApiOrigin ? ` ${facialApiOrigin}` : "";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://images.unsplash.com${facialCspOrigin}`,
  "font-src 'self' data:",
  `connect-src 'self' https://challenges.cloudflare.com${facialCspOrigin}`,
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  compress: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/criminalidadefacial",
        headers: [
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

if (process.env.ENABLE_OPENNEXT_DEV_PROXY === "1") {
  void import("@opennextjs/cloudflare").then((module) => module.initOpenNextCloudflareForDev());
}
