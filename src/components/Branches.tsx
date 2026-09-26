import Image from "next/image";
import {
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ReceiptText,
  Star,
  Store,
  ZoomIn,
} from "lucide-react";
import {
  branches,
  branchWhatsappLink,
  directionsUrl,
  mapEmbedUrl,
} from "@/data/branches";
import { siteConfig } from "@/data/site-config";
import { asset } from "@/lib/base-path";

/**
 * قسم «فروعنا»: كارت لكل فرع فيه الخريطة + العنوان + المواعيد + رقم التليفون
 * + أزرار (اتصال / واتساب / الاتجاهات).
 *
 * كل البيانات بتيجي من src/data/branches.ts — التعديل بيتعمل هناك بس.
 * الخريطة iframe من خرائط جوجل (output=embed) فمن غير أي API key،
 * وبتشتغل تمام في النسخة الثابتة على GitHub Pages.
 *
 * ولو الفرع عنده صورة قائمة أسعار (priceListImage) بتتعرض في بلوك
 * «قائمة الأسعار» تحت الخريطة — الصورة بتتحمّل بـ asset() علشان مسار
 * GitHub Pages (/SaddamBarbe) يبقى صح.
 */
export default function Branches() {
  if (branches.length === 0) return null;

  return (
    <section
      id="branches"
      className="border-t border-[#c9a227]/20 bg-[#0f0f0f] section-padding"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            <Store className="h-4 w-4" />
            فروعنا
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            أقرب فرع ليك مستنيك
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#f5f0e6]/70">
            فرعينا في القاهرة: حدائق القبة ومدينة نصر. اختار الفرع الأقرب لك،
            وشوف مكانه على الخريطة، وكلمنا مباشرة أو احجز على واتساب في ثواني.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {branches.map((branch) => (
            <article
              key={branch.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#c9a227]/20 bg-[#1a1a1a] transition-all duration-300 hover:border-[#c9a227]/50 hover:shadow-[0_0_40px_rgba(201,162,39,0.12)]"
            >
              {/* الخريطة */}
              <div className="relative h-60 w-full overflow-hidden bg-[#0f0f0f] md:h-72">
                <iframe
                  src={mapEmbedUrl(branch)}
                  title={`خريطة ${branch.nameAr}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0 contrast-[1.05] saturate-[0.85]"
                />
                <a
                  href={directionsUrl(branch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 start-3 inline-flex items-center gap-2 rounded-full bg-[#0f0f0f]/90 px-4 py-2 text-xs font-semibold text-[#c9a227] backdrop-blur-sm transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  افتح الخريطة الكبيرة
                </a>
              </div>

              {/* التفاصيل */}
              <div className="flex flex-1 flex-col gap-5 p-6 md:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-[#f5f0e6]">
                      {branch.nameAr}
                    </h3>
                    {branch.badgeAr && (
                      <span className="rounded-full bg-[#c9a227]/15 px-3 py-1 text-xs font-bold text-[#c9a227]">
                        {branch.badgeAr}
                      </span>
                    )}
                    {typeof branch.googleRating === "number" && (
                      <span className="flex items-center gap-1 rounded-full border border-[#c9a227]/30 px-3 py-1 text-xs font-semibold text-[#c9a227]">
                        <Star className="h-3 w-3 fill-[#c9a227]" />
                        {branch.googleRating.toFixed(1)}
                        {typeof branch.googleReviews === "number"
                          ? ` (${branch.googleReviews} تقييم)`
                          : ""}{" "}
                        على خرائط جوجل
                      </span>
                    )}
                  </div>
                  {branch.listingNameAr && (
                    <p className="mt-2 text-xs text-[#f5f0e6]/50">
                      {branch.listingNameAr}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 text-sm text-[#f5f0e6]/80">
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />
                    <span className="leading-relaxed">
                      {branch.addressAr}
                      {branch.landmarkAr && (
                        <span className="mt-1 block text-xs text-[#f5f0e6]/50">
                          علامة مميزة: {branch.landmarkAr}
                        </span>
                      )}
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />
                    <a
                      href={branch.phoneHref}
                      dir="ltr"
                      className="font-semibold tracking-wide transition-colors hover:text-[#c9a227]"
                    >
                      {branch.phoneDisplay}
                    </a>
                  </li>

                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />
                    <span className="leading-relaxed">{branch.hoursAr}</span>
                  </li>
                </ul>

                {/* قائمة أسعار الفرع — بتظهر بس للفروع اللي فيها priceListImage */}
                {branch.priceListImage && (
                  <div className="rounded-2xl border border-[#c9a227]/20 bg-[#0f0f0f]/70 p-4 md:p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-[#c9a227]">
                        <ReceiptText className="h-4 w-4" />
                        قائمة الأسعار
                      </h4>
                      <a
                        href={asset(branch.priceListImage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f5f0e6]/60 transition-colors hover:text-[#c9a227]"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                        اضغط للتكبير
                      </a>
                    </div>
                    <a
                      href={asset(branch.priceListImage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      aria-label={`قائمة أسعار ${branch.nameAr} بالحجم الكامل`}
                    >
                      <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-[#0f0f0f] md:h-[480px]">
                        <Image
                          src={asset(branch.priceListImage)}
                          alt={`قائمة أسعار ${branch.nameAr}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-contain"
                        />
                      </div>
                    </a>
                    <p className="mt-3 text-center text-xs text-[#f5f0e6]/50">
                      الأسعار دي خاصة بـ{branch.nameAr} — لسه فيها تحديث؟ كلمنا
                      وهنأكد عليك السعر قبل الحجز.
                    </p>
                  </div>
                )}

                <div className="mt-auto grid gap-3 sm:grid-cols-2">
                  <a
                    href={branch.phoneHref}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#c9a227] px-5 py-3 text-sm font-bold text-[#0f0f0f] transition-transform hover:scale-[1.02]"
                  >
                    <Phone className="h-4 w-4" />
                    اتصل بالفرع
                  </a>
                  <a
                    href={branchWhatsappLink(branch, siteConfig.nameAr)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full border border-[#c9a227]/40 px-5 py-3 text-sm font-semibold text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    احجز واتساب
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
