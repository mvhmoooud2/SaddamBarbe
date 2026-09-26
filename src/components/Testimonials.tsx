import { ExternalLink, MapPin, Quote, Star } from "lucide-react";
import { branches as staticBranches, type Branch } from "@/data/branches";
import type { Testimonial } from "@/db/schema";
import { setting, type SiteSettingsMap } from "@/lib/site-settings";

type TestimonialsProps = {
  branches?: Branch[];
  /** آراء العملاء المضافة من لوحة التحكم (لو فاضية بنعرض تقييمات جوجل بس) */
  testimonials?: Testimonial[];
  settings?: SiteSettingsMap;
};

export default function Testimonials({
  branches = staticBranches,
  testimonials = [],
  settings,
}: TestimonialsProps) {
  return (
    <section id="testimonials" className="section-padding bg-[#0f0f0f]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            {setting(settings, "testimonialsKicker")}
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            {setting(settings, "testimonialsTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#f5f0e6]/70">
            {setting(settings, "testimonialsSubtitle")}
          </p>
        </div>

        {testimonials.length > 0 && (
          <div className="mb-12 grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="rounded-2xl border border-[#c9a227]/20 bg-[#1a1a1a] p-6"
              >
                <Quote className="mb-3 h-6 w-6 text-[#c9a227]" />
                <p className="mb-4 leading-relaxed text-[#f5f0e6]/80">
                  {testimonial.commentAr}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#f5f0e6]">
                    {testimonial.customerName}
                  </span>
                  <span className="flex items-center gap-0.5 text-[#c9a227]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < testimonial.rating ? "fill-[#c9a227]" : "opacity-30"
                        }`}
                      />
                    ))}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

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
