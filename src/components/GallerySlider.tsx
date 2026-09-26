"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Pause, Play } from "lucide-react";
import { asset } from "@/lib/base-path";
import { setting, type SiteSettingsMap } from "@/lib/site-settings";
import { galleryData, type GalleryItem } from "@/data/gallery";

/**
 * صور المعرض.
 * الصور مقاساتها مختلفة (أفقية ورأسية)، فالسلايدر بيعرضها كاملة (object-contain)
 * فوق نسخة مموّهة من نفس الصورة علشان الشكل يبقى موحّد من غير ما نقص أي جزء منها.
 */

const AUTOPLAY_MS = 5000;

type GallerySliderProps = {
  images?: GalleryItem[];
  settings?: SiteSettingsMap;
};

export default function GallerySlider({
  images,
  settings,
}: GallerySliderProps) {
  const galleryImages = images && images.length > 0 ? images : galleryData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hasFocus, setHasFocus] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = galleryImages.length;

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(((index % total) + total) % total);
  }, [total]);

  // في صفحة RTL: التالي على الشمال (السهم بيشاور لليسار) والسابق على اليمين
  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // تشغيل تلقائي (بيتوقف عند اللمس/الوقوف بالماوس/التركيز بالكيبورد وعند تبويب مخفي)
  useEffect(() => {
    if (!isAutoPlaying || hasFocus) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = setInterval(nextSlide, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isAutoPlaying, hasFocus, nextSlide]);

  // التحريك بالكيبورد (يمين = السابق، شمال = التالي)
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      nextSlide();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      prevSlide();
    }
  };

  // السحب باللمس على الموبايل
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) return;

    const deltaX = event.changedTouches[0].clientX - startX;
    if (Math.abs(deltaX) < 45) return;
    // السحب لليسار → التالي، ولليمين → السابق
    if (deltaX < 0) nextSlide();
    else prevSlide();
  };

  return (
    <section
      id="gallery"
      className="bg-[#0f0f0f] py-8 md:py-12"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            {setting(settings, "galleryKicker")}
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            {setting(settings, "galleryTitle")}
          </h2>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="معرض صور الصالون"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          className="group relative overflow-hidden rounded-3xl border border-[#c9a227]/20 bg-[#1a1a1a] outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-[16/9]">
            {galleryImages.map((image, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={image.src}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  {/* خلفية مموّهة من نفس الصورة علشان المساحات الفاضية تبان أنيقة */}
                  <Image
                    src={asset(image.src)}
                    alt=""
                    fill
                    aria-hidden
                    sizes="100vw"
                    className="scale-110 object-cover opacity-30 blur-2xl"
                  />
                  <Image
                    src={asset(image.src)}
                    alt={image.alt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 1200px"
                    className="object-contain p-1 drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
                  />
                </div>
              );
            })}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/60 via-transparent to-[#0f0f0f]/20" />
          </div>

          {/* السابق (يمين) */}
          <button
            onClick={prevSlide}
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#0f0f0f]/60 text-[#c9a227] backdrop-blur-sm transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f] md:right-4 md:h-12 md:w-12"
            aria-label="الصورة السابقة"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* التالي (شمال) */}
          <button
            onClick={nextSlide}
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#0f0f0f]/60 text-[#c9a227] backdrop-blur-sm transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f] md:left-4 md:h-12 md:w-12"
            aria-label="الصورة التالية"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* وقف/تشغيل العرض التلقائي */}
          <button
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#0f0f0f]/60 text-[#c9a227] backdrop-blur-sm transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f] md:right-4 md:top-4"
            aria-label={isAutoPlaying ? "إيقاف العرض التلقائي" : "تشغيل العرض التلقائي"}
          >
            {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          {/* عدّاد الصور */}
          <div className="absolute left-3 top-3 rounded-full border border-[#c9a227]/30 bg-[#0f0f0f]/60 px-3 py-1 text-xs font-medium text-[#f5f0e6] backdrop-blur-sm md:left-4 md:top-4">
            {currentIndex + 1} / {total}
          </div>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {galleryImages.map((image, index) => (
              <button
                key={image.src}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-[#c9a227]"
                    : "w-2 bg-[#f5f0e6]/40 hover:bg-[#f5f0e6]/60"
                }`}
                aria-label={`اذهب للصورة ${index + 1}`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>

          {/* وصف الصورة الحالية */}
          <p className="pointer-events-none absolute bottom-4 right-4 hidden max-w-sm rounded-full bg-[#0f0f0f]/70 px-4 py-2 text-xs text-[#f5f0e6]/80 backdrop-blur-sm md:block">
            {galleryImages[currentIndex].alt}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              onClick={() => goToSlide(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                index === currentIndex
                  ? "border-[#c9a227] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={image.alt}
            >
              <Image
                src={asset(image.src)}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, 16vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
