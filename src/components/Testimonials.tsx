import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/db/schema";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section id="testimonials" className="section-padding bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            آراء العملاء
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            ماذا يقول عملاؤنا
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#f5f0e6]/70">
            نفخر بثقة عملائنا ونسعى دائماً لتقديم الأفضل.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative rounded-2xl border border-[#c9a227]/10 bg-[#1a1a1a] p-8"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-[#c9a227]/20" />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "fill-[#c9a227] text-[#c9a227]"
                        : "text-[#f5f0e6]/20"
                    }`}
                  />
                ))}
              </div>
              <p className="mb-6 text-base leading-relaxed text-[#f5f0e6]/80">
                &ldquo;{testimonial.commentAr}&rdquo;
              </p>
              <p className="text-sm font-bold text-[#c9a227]">
                — {testimonial.customerName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
