/**
 * صور المعرض الافتراضية — بتتزرع في جدول gallery_images
 * وبعد كده التعديل بيتم من لوحة التحكم (/admin).
 */
export type GalleryItem = { src: string; alt: string };

export const galleryData: GalleryItem[] = [
  { src: "/images/gallery-1.jpg", alt: "جلسة عناية بالذقن مع بخار الوجه وترطيب بالزيت" },
  { src: "/images/gallery-2.jpg", alt: "تنظيف وتشكيل الأظافر (مانيكير) بعناية في الصالون" },
  { src: "/images/gallery-3.jpg", alt: "تنظيف عميق للبشرة بالبخار مع تقشير الوجه" },
  { src: "/images/gallery-4.jpg", alt: "وضع ماسك الوجه بفرشاة احترافية داخل غرفة العناية" },
  { src: "/images/gallery-5.jpg", alt: "تغذية البشرة بالبخار مع سيروم مرطّب للوجه" },
  { src: "/images/gallery-6.jpg", alt: "دهان زيت العناية بالبشرة بعد جلسة التنظيف" },
];
