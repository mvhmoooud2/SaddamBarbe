"use client";

import { useState } from "react";
import { Calendar, Clock, User, Phone, MessageSquare, Check, Loader2 } from "lucide-react";
import type { Service, Barber } from "@/db/schema";

interface BookingFormProps {
  services: Service[];
  barbers: Barber[];
}

export default function BookingForm({ services, barbers }: BookingFormProps) {
  const [formData, setFormData] = useState(() => ({
    customerName: "",
    customerPhone: "",
    serviceId: services.length > 0 ? String(services[0].id) : "",
    barberId: "",
    date: "",
    time: "",
    notes: "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const availableTimes = [
    "10:00", "11:00", "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          serviceId: Number(formData.serviceId),
          barberId: formData.barberId ? Number(formData.barberId) : null,
          appointmentDate: appointmentDate.toISOString(),
          notes: formData.notes,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 404) {
        throw new Error(
          "الحجز الإلكتروني غير متاح في النسخة الثابتة — تواصل معنا مباشرة وسنؤكد موعدك فوراً."
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء الحجز");
      }

      setMessage({ type: "success", text: "تم حجز موعدك بنجاح! سنتواصل معك قريباً للتأكيد." });
      setFormData({
        customerName: "",
        customerPhone: "",
        serviceId: String(services[0]?.id || ""),
        barberId: "",
        date: "",
        time: "",
        notes: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "حدث خطأ أثناء الحجز",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

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
          className="rounded-3xl border border-[#c9a227]/20 bg-[#0f0f0f] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.4)] md:p-10"
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
                placeholder="01X XXXX XXXX"
                className="w-full rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] px-4 py-3 text-[#f5f0e6] outline-none transition-colors focus:border-[#c9a227]"
              />
            </div>

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
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nameAr} - {Number(service.price).toFixed(0)} ج.م
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#f5f0e6]/80">
                <User className="h-4 w-4 text-[#c9a227]" />
                الحلاق (اختياري)
              </label>
              <select
                name="barberId"
                value={formData.barberId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] px-4 py-3 text-[#f5f0e6] outline-none transition-colors focus:border-[#c9a227]"
              >
                <option value="">أي حلاق متاح</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.nameAr}
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
                min={today}
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
              className={`mt-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {message.type === "success" && <Check className="h-4 w-4" />}
              {message.text}
            </div>
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
