"use client";

import Image from "next/image";
import { Clock, Info, MapPin, Scissors, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/db/schema";
import { asset } from "@/lib/base-path";
import { branches } from "@/data/branches";
import { getBranchServiceOptions } from "@/data/branch-services";
import {
  BRANCH_SELECTION_EVENT,
} from "@/components/ExperienceChooser";
import BookServiceButton from "@/components/BookServiceButton";

interface ServicesProps {
  services: Service[];
}

function formatPrice(price: string | number) {
  return Number(price).toFixed(0);
}

export default function Services({ services }: ServicesProps) {
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id ?? "");

  useEffect(() => {
    const onBranchSelected = (event: Event) => {
      const branchId = (event as CustomEvent<string>).detail;
      if (branches.some((branch) => branch.id === branchId)) {
        setSelectedBranchId(branchId);
      }
    };

    window.addEventListener(BRANCH_SELECTION_EVENT, onBranchSelected);
    return () => window.removeEventListener(BRANCH_SELECTION_EVENT, onBranchSelected);
  }, []);

  const selectedBranch =
    branches.find((branch) => branch.id === selectedBranchId) ?? branches[0];
  const branchServices = useMemo(
    () => getBranchServiceOptions(selectedBranchId, services),
    [selectedBranchId, services],
  );
  const groupedServices = useMemo(
    () =>
      branchServices.reduce<Record<string, typeof branchServices>>((groups, service) => {
        (groups[service.categoryAr] ??= []).push(service);
        return groups;
      }, {}),
    [branchServices],
  );

  if (!selectedBranch) return null;

  return (
    <section id="services" className="section-padding bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            اختار الفرع الأول
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            خدمات كل فرع بوضوح
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#f5f0e6]/70">
            مفيش قائمة واحدة ملخبطة: اختار فرعك وهتشوف الخدمات المتاحة فيه فقط،
            وبعدها احجز الخدمة على واتساب في ضغطة.
          </p>
        </div>

        <div className="mx-auto mb-12 grid max-w-4xl gap-3 sm:grid-cols-2">
          {branches.map((branch) => {
            const isSelected = branch.id === selectedBranch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => setSelectedBranchId(branch.id)}
                className={`rounded-2xl border p-4 text-right transition-all ${
                  isSelected
                    ? "border-[#c9a227] bg-[#c9a227]/10 shadow-[0_0_30px_rgba(201,162,39,0.1)]"
                    : "border-[#c9a227]/15 bg-[#1a1a1a] hover:border-[#c9a227]/50"
                }`}
                aria-pressed={isSelected}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#c9a227]">
                  {branch.id === "nasr-city" ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <Scissors className="h-4 w-4" />
                  )}
                  {branch.id === "nasr-city"
                    ? "VIP MEN EXPERIENCE"
                    : "حلاقة وعناية"}
                </span>
                <span className="mt-1 block text-lg font-bold text-[#f5f0e6]">
                  {branch.nameAr}
                </span>
                <span className="mt-1 flex items-center gap-1 text-xs text-[#f5f0e6]/60">
                  <MapPin className="h-3.5 w-3.5" />
                  {branch.addressAr}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#c9a227]/25 bg-[#1a1a1a] p-5 text-center sm:flex-row sm:text-right">
          <div>
            <p className="text-sm font-semibold text-[#c9a227]">
              {selectedBranch.id === "nasr-city"
                ? "👑 VIP MEN EXPERIENCE"
                : "✂️ حلاقة وعناية"}
            </p>
            <h3 className="mt-1 text-2xl font-bold text-[#f5f0e6]">
              {selectedBranch.nameAr}
            </h3>
            <p className="mt-1 text-sm text-[#f5f0e6]/60">
              {selectedBranch.id === "nasr-city"
                ? "الخدمات الأساسية بالإضافة إلى الساونا والاستيم والحمام المغربي والجاكوزي والمساج."
                : "قص وحلاقة وعناية بالشعر والبشرة والأظافر — بدون ساونا أو جاكوزي."
              }
            </p>
          </div>
          <a
            href={selectedBranch.phoneHref}
            dir="ltr"
            className="shrink-0 rounded-full border border-[#c9a227]/40 px-5 py-2.5 text-sm font-bold text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
          >
            {selectedBranch.phoneDisplay}
          </a>
        </div>

        <div className="space-y-14">
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <div key={category}>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-[#c9a227]/20" />
                <h3 className="text-lg font-bold text-[#c9a227]">{category}</h3>
                <span className="h-px flex-1 bg-[#c9a227]/20" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryServices.map((service) => {
                  const isPerGram = /لكل جرام/.test(service.nameAr);
                  return (
                    <article
                      key={service.id}
                      className="group overflow-hidden rounded-2xl border border-[#c9a227]/10 bg-[#1a1a1a] transition-transform hover:-translate-y-1 hover:border-[#c9a227]/40"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={asset(service.imageUrl || "/images/hero.jpg")}
                          alt={service.displayNameAr}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/85 to-transparent" />
                        <div className="absolute bottom-4 start-4 rounded-full bg-[#c9a227] px-3 py-1 text-sm font-bold text-[#0f0f0f]">
                          {formatPrice(service.price)} ج.م
                          {isPerGram ? " / جرام" : ""}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="mb-2 flex items-center gap-2 text-[#c9a227]">
                          <Scissors className="h-4 w-4" />
                          <span className="text-xs font-medium">{service.nameEn}</span>
                        </div>
                        <h4 className="mb-2 text-xl font-bold text-[#f5f0e6]">
                          {service.displayNameAr}
                        </h4>
                        <p className="mb-4 min-h-12 text-sm leading-relaxed text-[#f5f0e6]/70">
                          {service.descriptionAr}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-[#f5f0e6]/60">
                          <Clock className="h-4 w-4" />
                          <span>{service.durationMinutes} دقيقة</span>
                        </div>
                        <BookServiceButton
                          serviceId={service.id}
                          serviceName={service.displayNameAr}
                          branch={selectedBranch}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 flex max-w-4xl flex-col items-center gap-3 rounded-2xl border border-[#c9a227]/25 bg-[#1a1a1a] px-6 py-5 text-center text-sm leading-relaxed text-[#f5f0e6]/80 sm:flex-row sm:items-start sm:text-start">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#c9a227]" />
          <span>
            الأسعار المعروضة استرشادية وقد تختلف حسب الفرع أو تفاصيل الخدمة. ابعتلنا على واتساب من زر الخدمة لتأكيد السعر والميعاد قبل الحجز.
          </span>
        </p>
      </div>
    </section>
  );
}
