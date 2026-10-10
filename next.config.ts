import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // every image ships pre-sized and pre-compressed, so serve the files straight from
  // the CDN instead of waiting on the on-demand optimizer (slow whenever its cache is cold)
  images: { unoptimized: true },
};

export default nextConfig;
