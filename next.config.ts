import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // büyük paketlerde kullanılmayan export'ların bundle'a girmesini engelle
  experimental: {
    optimizePackageImports: [
      "motion",
      "gsap",
      "recharts",
      "@tanstack/react-table",
      "@tanstack/react-query",
      "cmdk",
      "xlsx",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "lucide-react",
    ],
  },
};

export default nextConfig;
