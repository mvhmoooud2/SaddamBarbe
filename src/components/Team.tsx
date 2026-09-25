import Image from "next/image";
import { Award } from "lucide-react";
import type { Barber } from "@/db/schema";

interface TeamProps {
  barbers: Barber[];
}

export default function Team({ barbers }: TeamProps) {
  return (
    <section id="team" className="section-padding bg-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            نخبة من المحترفين
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            فريقنا
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#f5f0e6]/70">
            يضم صالوننا نخبة من الحلاقين المحترفين الذين يضعون خبراتهم في خدمة مظهرك.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="group rounded-2xl border border-[#c9a227]/10 bg-[#0f0f0f] p-6 text-center transition-shadow hover:shadow-[0_0_30px_rgba(201,162,39,0.15)]"
            >
              <div className="relative mx-auto mb-6 h-48 w-48 overflow-hidden rounded-full border-2 border-[#c9a227]/30">
                <Image
                  src={barber.imageUrl || "/images/hero.jpg"}
                  alt={barber.nameAr}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="mb-3 flex items-center justify-center gap-2 text-[#c9a227]">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">{barber.roleEn}</span>
              </div>
              <h3 className="mb-1 text-xl font-bold text-[#f5f0e6]">
                {barber.nameAr}
              </h3>
              <p className="mb-3 text-sm font-medium text-[#c9a227]/80">
                {barber.roleAr}
              </p>
              <p className="text-sm leading-relaxed text-[#f5f0e6]/70">
                {barber.bioAr}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
