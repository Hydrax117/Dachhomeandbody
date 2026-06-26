import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Generate cryptographic integrity hashes for all JS chunks at build time.
    // Browsers verify these hashes before executing scripts, preventing
    // tampered or injected scripts from running even if served from the CDN.
    sri: {
      algorithm: "sha256",
    },
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
