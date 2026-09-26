import type { NextConfig } from "next";

// STATIC_EXPORT=1 → بناء نسخة ثابتة لنشرها على GitHub Pages
// (بدون API routes وبدون قاعدة بيانات، الموقع بيشتغل بالبيانات الثابتة)
const isStatic = process.env.STATIC_EXPORT === "1";

// GitHub Pages بيخدم الموقع على /<اسم-المستودع> مش على الجذر.
// اسم المستودع: SaddamBarber → المسار /SaddamBarber
//
// نفس المتغير (NEXT_PUBLIC_BASE_PATH) مستخدم جوه المكونات عبر
// src/lib/base-path.ts علشان الصور تتحمّل من نفس المسار الصح،
// وأيضاً علشان الصفحة تتحمّل في التطوير على الجذر من غير أي بادئة.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

if (isStatic && !basePath) {
  console.warn(
    "\n⚠️  STATIC_EXPORT=1 من غير NEXT_PUBLIC_BASE_PATH — نسخة GitHub Pages المفروض" +
      " تتبني بـ NEXT_PUBLIC_BASE_PATH=/SaddamBarber وإلا ملفات CSS/JS/الصور هتبقى 404.\n"
  );
}

// على Vercel مفيش داعي لـ standalone (المنصة بتتولى التغليف بنفسها)
const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  output: isStatic ? "export" : isVercel ? undefined : "standalone",
  basePath,
  // التصدير الثابت مالهوش Image Optimization endpoint
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
