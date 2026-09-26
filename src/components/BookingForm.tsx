"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Check,
  Loader2,
  MessageCircle,
} from "lucide-react";
import type { Service } from "@/db/schema";
import { basePath } from "@/lib/base-path";
import { siteConfig, whatsappLinkTo } from "@/data/site-config";
import { branches, branchWhatsappLinkWithMessage } from "@/data/branches";
import { BOOK_SERVICE_EVENT } from "@/components/BookServiceButton";

interface BookingFormProps {
  services: Service[];
}

const emptyForm = (services: Service[]) => ({
  customerName: "",
  customerPhone: "",
  serviceId: services.length > 0 ? String(services[0].id) : "",
  branchId: branches.length > 0 ? branches[0].id : "",
  date: "",
  time: "",
  notes: "",
});

/** تاريخ النهاردة بتوقيت المستخدم (مش UTC) علشان يمنع اختيار يوم عدّى */
function localToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().split("T")[0];
}

export default function BookingForm({ services }: BookingFormProps) {
  const [formData, setFormData] = useState(() => emptyForm(services));
  const [isSubmitting, setIsSubmitting] = useState(false);
  // بنحددها بعد التحميل علشان مايحصلش اختلاف بين السيرفر والمتصفح (hydration)
  const [minDate, setMinDate] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [whatsappFallback, setWhatsappFallback] = useState<string | null>(null);
  // إضاءة مؤقتة للفورم لما الزائر ييجي من زر «احجز هذه الخدمة»
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    // التاريخ بيتحسب في المتصفح بعد التحميل، لأن السيرفر (أو وقت البناء في
    // النسخة الثابتة) ممكن يكون بتوقيت مختلف فيطلع تحذير اختلاف في العرض
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMinDate(localToday());
  }, []);

  // لما الزائر يضغط «احجز هذه الخدمة» من كارت خدمة، بنحدد الخدمة دي
  // تلقائياً في قائمة الفورم وبنضوي على الفورم لحظة علشان يلاقيه بسرعة
  useEffect(() => {
    const onBookService = (event: Event) => {
      const serviceId = (event as CustomEvent<number>).detail;
      if (
        !services.some((service) => String(service.id) === String(serviceId))
      ) {
        return;
      }
      setFormData((prev) => ({ ...prev, serviceId: String(serviceId) }));
      setMessage(null);
      setWhatsappFallback(null);
      setIsHighlighted(true);
    };

    window.addEventListener(BOOK_SERVICE_EVENT, onBookService);
    return () => window.removeEventListener(BOOK_SERVICE_EVENT, onBookService);
  }, [services]);

  // الإضاءة بتروح لوحدها بعد لحظة
  useEffect(() => {
    if (!isHighlighted) return;
    const timer = setTimeout(() => setIsHighlighted(false), 2000);
    return () => clearTimeout(timer);
  }, [isHighlighted]);

  // مواعيد الحجز مطابقة لمواعيد الفرعين الفعلية (من 11:00 صباحاً حتى بعد منتصف الليل)
  const availableTimes = [
    "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
    "00:00", "01:00",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
    setWhatsappFallback(null);
  };

  /** الفرع المختار في الفورم (ولو مفيش اختيار بيستخدم الفرع الأساسي) */
  const selectedBranch = () =>
    branches.find((branch) => branch.id === formData.branchId) ?? branches[0];

  /** نص رسالة الواتساب الجاهزة (بتُستخدم لما الـ API مش متاح) */
  const bookingText = () => {
    const service = services.find((item) => String(item.id) === formData.serviceId);
    const branch = selectedBranch();

    return [
      `طلب حجز جديد من موقع ${siteConfig.nameAr}`,
      `الاسم: ${formData.customerName}`,
      `الموبايل: ${formData.customerPhone}`,
      branch ? `الفرع: ${branch.nameAr}` : "",
      `الخدمة: ${service ? service.nameAr : "غير محددة"}`,
      `الميعاد: ${formData.date} - ${formData.time}`,
      formData.notes ? `ملاحظات: ${formData.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  /**
   * لينك واتساب الحجز — بيروح على رقم الفرع اللي العميل اختاره،
   * مش على رقم واحد عام، علشان الحجز يوصل للفرع الصح.
   */
  const bookingWhatsappLink = (text: string) => {
    const branch = selectedBranch();
    return branch
      ? branchWhatsappLinkWithMessage(branch, text)
      : whatsappLinkTo(siteConfig.whatsapp, text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setWhatsappFallback(null);

    const text = bookingText();
    const branch = selectedBranch();

    try {
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch(`${basePath}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          serviceId: Number(formData.serviceId),
          appointmentDate: appointmentDate.toISOString(),
          // اسم الفرع بيتبعت جوه الملاحظات لأن جدول الحجوزات ملوش عمود للفرع
          notes: [branch?.nameAr, formData.notes].filter(Boolean).join(" — "),
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : null;

      if (response.ok) {
        setMessage({
          type: "success",
          text: "تم حجز موعدك بنجاح! سنتواصل معك قريباً للتأكيد.",
        });
        setFormData(emptyForm(services));
        return;
      }

      // رسالة واضحة من السيرفر (وقت محجوز، خارج المواعيد، ...)
      if (data?.error) {
        setMessage({ type: "error", text: data.error });
        return;
      }

      // مفيش API في النسخة دي (النسخة الثابتة على GitHub Pages)
      setWhatsappFallback(bookingWhatsappLink(text));
      setMessage({
        type: "error",
        text: "الحجز الإلكتروني مش متاح في النسخة الحالية، بس ممكن تبعتلنا نفس التفاصيل على الواتساب في ضغطة واحدة.",
      });
    } catch {
      // الشبكة وقعت أو الـ API مش موجود → نكمّل على الواتساب
      setWhatsappFallback(bookingWhatsappLink(text));
      setMessage({
        type: "error",
        text: "مش قادرين نوصّل للحجز الإلكتروني دلوقتي، ابعتلنا التفاصيل على الواتساب ونتأكدلك الميعاد فوراً.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="section-padding bg-[#1a1a1a]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            احجز موعدك
          </p>
          <h2 className="text-3xl font-bold text-[#f5f0e6] md:text-4xl">
            حجز موعد سريع
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#f5f0e6]/70">
            اختر الخدمة والوقت المناسب لك، وسنقوم بالتواصل معك لتأكيد الحجز.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-3xl border bg-[#0f0f0f] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.4)] transition-all duration-500 md:p-10 ${
            isHighlighted
              ? "border-[#c9a227] shadow-[0_0_50px_rgba(201,162,39,0.2)]"
              : "border-[#c9a227]/20"
          }`}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#f5f0e6]/80">
                <User className="h-4 w-4 text-[#c9a227]" />
                الاسم
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                minLength={2}
                placeholder="أدخل اسمك"
                className="w-full rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] px-4 py-3 text-[#f5f0e6] outline-none transition-colors focus:border-[#c9a227]"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#f5f0e6]/80">
                <Phone className="h-4 w-4 text-[#c9a227]" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                inputMode="tel"
                pattern="^[0-9+\s()-]{8,15}$"
                title="اكتب رقم موبايل صحيح (مثال: 01012345678)"
                placeholder="01012345678"
                className="w-full rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] px-4 py-3 text-[#f5f0e6] outline-none transition-colors focus:border-[#c9a227]"
              />
            </div>

            {branches.length > 0 && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#f5f0e6]/80">
                  <MapPin className="h-4 w-4 text-[#c9a227]" />
                  الفرع
                </label>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] px-4 py-3 text-[#f5f0e6] outline-none transition-colors focus:border-[#c9a227]"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.nameAr} — {branch.phoneDisplay}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#f5f0e6]/80">
                <Calendar className="h-4 w-4 text-[#c9a227]" />
                الخدمة
              </label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] px-4 py-3 text-[#f5f0e6] outline-none transition-colors focus:border-[#c9a227]"
              >
                {services.length === 0 && <option value="">لا توجد خدمات متاحة</option>}
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nameAr} - {Number(service.price).toFixed(0)} ج.م
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#f5f0e6]/80">
                <Calendar className="h-4 w-4 text-[#c9a227]" />
                التاريخ
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={minDate || undefined}
                className="w-full rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] px-4 py-3 text-[#f5f0e6] outline-none transition-colors focus:border-[#c9a227]"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#f5f0e6]/80">
                <Clock className="h-4 w-4 text-[#c9a227]" />
                الوقت
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] px-4 py-3 text-[#f5f0e6] outline-none transition-colors focus:border-[#c9a227]"
              >
                <option value="">اختر الوقت</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                    {Number(time.slice(0, 2)) < 3 ? " (بعد منتصف الليل)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#f5f0e6]/80">
              <MessageSquare className="h-4 w-4 text-[#c9a227]" />
              ملاحظات (اختياري)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="أي تفاصيل إضافية ترغب في إضافتها..."
              className="w-full rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] px-4 py-3 text-[#f5f0e6] outline-none transition-colors focus:border-[#c9a227]"
            />
          </div>

          {message && (
            <div
              className={`mt-6 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-amber-500/10 text-amber-300"
              }`}
              role="status"
              aria-live="polite"
            >
              {message.type === "success" && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {whatsappFallback && (
            <a
              href={whatsappFallback}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 font-bold text-[#0f0f0f] transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="h-5 w-5" />
              ابعت الحجز على واتساب
            </a>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#c9a227] px-8 py-4 font-bold text-[#0f0f0f] transition-transform hover:scale-[1.02] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري الحجز...
              </>
            ) : (
              "تأكيد الحجز"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
