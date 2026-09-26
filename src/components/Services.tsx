import Image from "next/image";
import { Clock, Info, Scissors } from "lucide-react";
import type { Service } from "@/db/schema";
import { asset } from "@/lib/base-path";
import { primaryBranch } from "@/data/branches";

interface ServicesProps {
  services: Service[];
}

function formatPrice(price: string | number) {
  return Number(price).toFixed(0);
}

export default function Services({ services }: ServicesProps) {
  return (
    <section id="services" className="section-padding bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            ما نقدمه
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            خدماتنا وأسعارنا
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#f5f0e6]/70">
            نقدم باقة متكاملة من خدمات العناية بالرجل بأعلى معايير الجودة والاحترافية.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="group overflow-hidden rounded-2xl border border-[#c9a227]/10 bg-[#1a1a1a] transition-transform hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={asset(service.imageUrl || "/images/hero.jpg")}
                  alt={service.nameAr}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/80 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-full bg-[#c9a227] px-3 py-1 text-sm font-bold text-[#0f0f0f]">
                  {formatPrice(service.price)} ج.م
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3 flex items-center gap-2 text-[#c9a227]">
                  <Scissors className="h-4 w-4" />
                  <span className="text-sm font-medium">{service.nameEn}</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-[#f5f0e6]">
                  {service.nameAr}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-[#f5f0e6]/70">
                  {service.descriptionAr}
                </p>
                <div className="flex items-center gap-2 text-sm text-[#f5f0e6]/60">
                  <Clock className="h-4 w-4" />
                  <span>{service.durationMinutes} دقيقة</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ملاحظة الأسعار: القائمة المعروضة هي قائمة فرع مدينة نصر،
            وأسعار فرع حدائق القبة ممكن تختلف — ورقم الفرع قابل للاتصال مباشرة */}
        <p className="mx-auto mt-12 flex max-w-4xl flex-col items-center gap-3 rounded-2xl border border-[#c9a227]/25 bg-[#1a1a1a] px-6 py-5 text-center text-sm leading-relaxed text-[#f5f0e6]/80 sm:flex-row sm:items-start sm:text-start">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#c9a227]" />
          <span>
            الأسعار المعروضة هي أسعار فرع مدينة نصر. أسعار فرع حدائق القبة ممكن
            تختلف — للاستفسار والحجز كلمنا على{" "}
            <a
              href={primaryBranch.phoneHref}
              dir="ltr"
              className="inline-block font-semibold tracking-wide whitespace-nowrap text-[#c9a227] transition-colors hover:text-[#f5f0e6]"
            >
              {primaryBranch.phoneDisplay}
            </a>
          </span>
        </p>
      </div>
    </section>
  );
}
