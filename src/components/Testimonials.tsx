import { ExternalLink, MapPin, Star } from "lucide-react";
import { branches } from "@/data/branches";

export default function Testimonials() {
  return (
    <section id="testimonials" className="section-padding bg-[#0f0f0f]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            تقييمات حقيقية
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            شوف تقييماتنا على Google
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#f5f0e6]/70">
            بدل ما نعرض كلام منسوب لعملاء من غير مصدر، تقدر تشوف التقييمات
            الحقيقية وتفاصيل كل فرع مباشرة على خرائط Google.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {branches.map((branch) => (
            <article
              key={branch.id}
              className="rounded-2xl border border-[#c9a227]/20 bg-[#1a1a1a] p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-lg font-bold text-[#f5f0e6]">
                    <MapPin className="h-5 w-5 text-[#c9a227]" />
                    {branch.nameAr}
                  </p>
                  <p className="mt-2 text-sm text-[#f5f0e6]/60">
                    {branch.addressAr}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#c9a227]/10 px-3 py-2 text-[#c9a227]">
                  <Star className="h-4 w-4 fill-[#c9a227]" />
                  <span className="font-black">
                    {branch.googleRating?.toFixed(1) ?? "—"}
                  </span>
                </div>
              </div>
              <p className="mb-5 text-sm text-[#f5f0e6]/60">
                {branch.googleReviews
                  ? `${branch.googleReviews} تقييم على Google`
                  : "التقييمات على Google"}
              </p>
              {branch.mapsUrl && (
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-[#c9a227]/40 px-5 py-3 text-sm font-bold text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                >
                  شوف التقييمات الحقيقية
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
