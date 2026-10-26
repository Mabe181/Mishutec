import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["msnodesqlv8", "mssql"],
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
