import Image from "next/image";
import { ArrowDown, Calendar, Flame } from "lucide-react";
import { asset } from "@/lib/base-path";
import ExperienceChooser from "@/components/ExperienceChooser";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-0 pb-14 pt-28"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={asset("/images/hero.jpg")}
          alt="SADDAM BARBER Shop Interior"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/75 to-[#0f0f0f]/35" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
          SADDAM BARBER
        </p>
        <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-bold leading-[1.1] text-[#f5f0e6]">
          SADDAM <span className="text-[#c9a227]">BARBER</span>
        </h1>
        <p className="mx-auto mt-6 flex items-center justify-center gap-2 text-xl font-bold leading-relaxed text-[#f5f0e6] md:text-2xl">
          مش مجرد حلاقة… دي تجربة صدام
          <Flame className="h-6 w-6 text-[#c9a227]" aria-hidden="true" />
        </p>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#c9a227]">
          VIP MEN EXPERIENCE
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#booking"
            className="flex items-center gap-2 rounded-full bg-[#c9a227] px-8 py-3 font-bold text-[#0f0f0f] transition-transform hover:scale-105"
          >
            <Calendar className="h-5 w-5" />
            احجز موعدك الآن
          </a>
          <a
            href="#services"
            className="flex items-center gap-2 rounded-full border border-[#f5f0e6]/30 px-8 py-3 font-semibold text-[#f5f0e6] transition-colors hover:border-[#c9a227] hover:text-[#c9a227]"
          >
            <ArrowDown className="h-5 w-5" />
            اكتشف خدماتنا
          </a>
        </div>

        <ExperienceChooser />
      </div>
    </section>
  );
}
