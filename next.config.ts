import type { NextConfig } from "next";

// STATIC_EXPORT=1 → بناء نسخة ثابتة لنشرها على GitHub Pages
// (بدون API routes وبدون قاعدة بيانات، الموقع بيشتغل بالبيانات الثابتة)
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  output: isStatic ? "export" : "standalone",
  basePath: isStatic ? "/SaddamBarber" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
