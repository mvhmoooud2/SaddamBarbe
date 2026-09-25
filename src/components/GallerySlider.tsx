"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

const galleryImages = [
  { src: "/images/gallery-1.jpg", alt: "Gallery image 1" },
  { src: "/images/gallery-2.jpg", alt: "Gallery image 2" },
  { src: "/images/gallery-3.jpg", alt: "Gallery image 3" },
  { src: "/images/gallery-4.jpg", alt: "Gallery image 4" },
  { src: "/images/gallery-5.jpg", alt: "Gallery image 5" },
  { src: "/images/gallery-6.jpg", alt: "Gallery image 6" },
];

export default function GallerySlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section
      id="gallery"
      className="bg-[#0f0f0f] py-8"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#c9a227]/20 bg-[#1a1a1a]">
          <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#0f0f0f]/60 text-[#c9a227] backdrop-blur-sm transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#0f0f0f]/60 text-[#c9a227] backdrop-blur-sm transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-[#c9a227]"
                    : "w-2 bg-[#f5f0e6]/40 hover:bg-[#f5f0e6]/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                index === currentIndex
                  ? "border-[#c9a227] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={image.alt}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
