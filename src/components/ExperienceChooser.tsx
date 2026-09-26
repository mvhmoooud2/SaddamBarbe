"use client";

import { Crown, Scissors } from "lucide-react";

export const BRANCH_SELECTION_EVENT = "saddam:select-branch";

function chooseBranch(branchId: string) {
  window.dispatchEvent(
    new CustomEvent<string>(BRANCH_SELECTION_EVENT, { detail: branchId }),
  );
}

export default function ExperienceChooser() {
  return (
    <div className="mx-auto mt-14 max-w-4xl text-start">
      <p className="mb-5 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
        اختار تجربتك 👑
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <a
          href="#services"
          onClick={() => chooseBranch("hadayek-qobbah")}
          className="group rounded-2xl border border-[#c9a227]/30 bg-[#0f0f0f]/70 p-5 text-right backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#c9a227] hover:bg-[#c9a227]/10"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c9a227]/15 text-[#c9a227]">
              <Scissors className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#f5f0e6]">حلاقة وعناية</h2>
              <p className="text-sm text-[#c9a227]">حدائق القبة</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#f5f0e6]/65">
            87 شارع مصر والسودان · من غير ساونا أو جاكوزي
          </p>
          <span className="mt-4 inline-block text-sm font-bold text-[#c9a227] transition-transform group-hover:-translate-x-1">
            شوف خدمات الفرع ←
          </span>
        </a>

        <a
          href="#services"
          onClick={() => chooseBranch("nasr-city")}
          className="group rounded-2xl border border-[#c9a227]/50 bg-[#c9a227]/10 p-5 text-right backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#c9a227] hover:bg-[#c9a227]/15"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c9a227] text-[#0f0f0f]">
              <Crown className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#f5f0e6]">VIP MEN EXPERIENCE</h2>
              <p className="text-sm text-[#c9a227]">مدينة نصر · عباس العقاد</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#f5f0e6]/70">
            حلاقة وعناية بالإضافة إلى الساونا والاستيم والحمام المغربي والجاكوزي والمساج
          </p>
          <span className="mt-4 inline-block text-sm font-bold text-[#c9a227] transition-transform group-hover:-translate-x-1">
            شوف التجربة كاملة ←
          </span>
        </a>
      </div>
    </div>
  );
}
