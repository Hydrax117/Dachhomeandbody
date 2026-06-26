import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // sri (Subresource Integrity) is intentionally disabled.
    // The app uses nonce-based CSP (script-src + strict-dynamic) for script
    // integrity, which is incompatible with SRI: SRI hashes are baked at build
    // time but nonce-rendered pages are generated per-request, causing
    // hash mismatches after every redeploy and breaking chunk loading.
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.papersmiths.co.uk",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
