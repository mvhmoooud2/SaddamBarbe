"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  BadgePercent,
  CalendarCheck,
  Check,
  Clock,
  Tag,
  X,
} from "lucide-react";
import type { Offer } from "@/db/schema";
import { asset } from "@/lib/base-path";

interface OffersProps {
  offers: Offer[];
}

function formatPrice(price: string | number) {
  return Number(price).toFixed(0);
}

function discountPercent(oldPrice: string | number, newPrice: string | number) {
  const old = Number(oldPrice);
  const current = Number(newPrice);
  if (!old || old <= current) return 0;
  return Math.round(((old - current) / old) * 100);
}

function savings(oldPrice: string | number, newPrice: string | number) {
  return Math.max(0, Number(oldPrice) - Number(newPrice)).toFixed(0);
}

function offerDetails(details: string | null) {
  if (!details) return [];
  return details
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatValidUntil(date: Date | null) {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export default function Offers({ offers }: OffersProps) {
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);

  const closeModal = useCallback(() => setActiveOffer(null), []);

  useEffect(() => {
    if (!activeOffer) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeOffer, closeModal]);

  if (offers.length === 0) return null;

  const details = activeOffer ? offerDetails(activeOffer.detailsAr) : [];
  const validUntil = activeOffer
    ? formatValidUntil(activeOffer.validUntil)
    : null;

  return (
    <section id="offers" className="section-padding bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            <Tag className="h-4 w-4" />
            عروض خاصة
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            عروضنا وخصوماتنا
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#f5f0e6]/70">
            اختر العرض المناسب لك واستفيد من أسعارنا المخفّضة. اضغط على صورة أي
            عرض لمعرفة تفاصيله الكاملة وحجز موعدك فوراً.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#c9a227]/20 bg-[#1a1a1a] transition-all duration-300 hover:-translate-y-2 hover:border-[#c9a227]/50 hover:shadow-[0_0_40px_rgba(201,162,39,0.12)]"
            >
              <button
                type="button"
                onClick={() => setActiveOffer(offer)}
                className="relative block aspect-[5/3] w-full overflow-hidden text-right"
                aria-label={`عرض تفاصيل ${offer.titleAr}`}
              >
                <Image
                  src={asset(offer.imageUrl || "/images/hero.jpg")}
                  alt={`${offer.titleAr} - السعر قبل العرض ${formatPrice(
                    offer.oldPrice,
                  )} جنيه وبعد العرض ${formatPrice(offer.newPrice)} جنيه`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/70 via-transparent to-transparent" />

                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="rounded-full border border-[#c9a227] bg-[#0f0f0f]/85 px-4 py-2 text-sm font-semibold text-[#c9a227] backdrop-blur-sm">
                    شاهد تفاصيل العرض
                  </span>
                </span>
              </button>

              <div className="flex flex-1 flex-col p-6">
                <p className="mb-5 text-sm leading-relaxed text-[#f5f0e6]/70">
                  {offer.descriptionAr}
                </p>

                <button
                  type="button"
                  onClick={() => setActiveOffer(offer)}
                  className="mt-auto w-full rounded-full border border-[#c9a227]/40 py-3 text-sm font-semibold text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                >
                  تفاصيل العرض
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-[#f5f0e6]/50">
          جميع الأسعار بالجنيه المصري · العروض سارية حتى تاريخ الانتهاء المذكور
        </p>
      </div>

      {activeOffer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={activeOffer.titleAr}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#c9a227]/30 bg-[#1a1a1a] shadow-[0_0_60px_rgba(201,162,39,0.15)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#f5f0e6]">
                    {activeOffer.titleAr}
                  </h3>
                  {activeOffer.badgeAr && (
                    <span className="mt-2 inline-block rounded-full bg-[#c9a227]/15 px-3 py-1 text-xs font-bold text-[#c9a227]">
                      {activeOffer.badgeAr}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#0f0f0f] text-[#f5f0e6] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                  aria-label="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-[#f5f0e6]/70">
                {activeOffer.descriptionAr}
              </p>

              <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-[#c9a227]/20 bg-[#0f0f0f] p-4">
                <div>
                  <span className="block text-xs text-[#f5f0e6]/40">
                    قبل العرض
                  </span>
                  <span className="text-lg font-bold text-[#f5f0e6]/40 line-through">
                    {formatPrice(activeOffer.oldPrice)} ج.م
                  </span>
                </div>

                <BadgePercent className="h-5 w-5 text-[#c9a227]" />

                <div>
                  <span className="block text-xs text-[#c9a227]">
                    بعد العرض
                  </span>
                  <span className="text-2xl font-black text-[#c9a227]">
                    {formatPrice(activeOffer.newPrice)} ج.م
                  </span>
                </div>

                <span className="ms-auto rounded-full bg-[#c9a227]/15 px-3 py-1 text-xs font-bold text-[#c9a227]">
                  وفّرت {savings(activeOffer.oldPrice, activeOffer.newPrice)}{" "}
                  ج.م
                </span>
              </div>

              <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#f5f0e6]">
                <Check className="h-5 w-5 text-[#c9a227]" />
                تفاصيل العرض
              </h4>

              {details.length > 0 ? (
                <ul className="mb-6 space-y-3">
                  {details.map((line, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[#f5f0e6]/80"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c9a227]/15 text-[#c9a227]">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-6 text-sm text-[#f5f0e6]/60">
                  لا توجد تفاصيل إضافية لهذا العرض.
                </p>
              )}

              {validUntil && (
                <p className="mb-6 flex items-center gap-2 text-xs text-[#f5f0e6]/50">
                  <Clock className="h-4 w-4" />
                  العرض ساري حتى {validUntil}
                </p>
              )}

              <a
                href="#booking"
                onClick={closeModal}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c9a227] px-6 py-4 text-lg font-bold text-[#0f0f0f] transition-transform hover:scale-[1.02]"
              >
                <CalendarCheck className="h-5 w-5" />
                الحجز
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
