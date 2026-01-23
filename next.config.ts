import type { NextConfig } from "next";
import { validateEnv } from "./src/lib/validateEnv";

validateEnv();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
};

export default nextConfig;
