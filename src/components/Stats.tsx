import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

const promises = [
  { icon: Sparkles, label: "تفاصيل دقيقة في كل خدمة" },
  { icon: ShieldCheck, label: "نظافة وأدوات شخصية" },
  { icon: HeartHandshake, label: "حجز مباشر مع الفرع" },
];

/**
 * وعود الخدمة بدل أرقام تسويقية غير موثقة. المكوّن غير مستخدم حالياً في
 * ترتيب الصفحة، لكنه يظل آمناً لو تم تفعيله لاحقاً.
 */
export default function Stats() {
  return (
    <section className="border-y border-[#c9a227]/20 bg-[#0f0f0f] py-12">
      <div className="mx-auto grid max-w-5xl gap-6 px-6 sm:grid-cols-3">
        {promises.map((promise) => (
          <div key={promise.label} className="flex items-center justify-center gap-3 text-center">
            <promise.icon className="h-6 w-6 shrink-0 text-[#c9a227]" />
            <span className="text-sm font-semibold text-[#f5f0e6]/80">{promise.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
