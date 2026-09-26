"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Database,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  PlusCircle,
  Scissors,
  Settings,
  Star,
  Tag,
  Users,
} from "lucide-react";

type Stats = {
  services: number;
  servicesActive: number;
  offersActive: number;
  branches: number;
  barbers: number;
  gallery: number;
  testimonials: number;
  appointments: number;
  appointmentsPending: number;
  appointmentsUpcoming: number;
  source?: string;
  latestAppointments: {
    id: number;
    customerName: string;
    customerPhone: string;
    appointmentDate: string;
    status: string;
    branchSlug?: string;
  }[];
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "في الانتظار", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  confirmed: { label: "مؤكد", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  completed: { label: "تم التنفيذ", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  cancelled: { label: "ملغي", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

export default function Overview({
  onOpenTab,
}: {
  onOpenTab: (key: string) => void;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "فشل التحميل");
        setStats(data);
      })
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  async function updateAppointmentStatus(id: number, status: string) {
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          latestAppointments: prev.latestAppointments.map((app) =>
            app.id === id ? { ...app, status } : app
          ),
        };
      });
    } catch {
      // ignore
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
        <p className="font-bold">تعذر تحميل الإحصائيات</p>
        <p className="mt-1 text-xs">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center py-20 text-[#c9a227]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      key: "appointments",
      labelAr: "حجوزات في الانتظار",
      value: stats.appointmentsPending,
      hint: `${stats.appointments} إجمالي الحجوزات`,
      icon: CalendarClock,
      highlight: stats.appointmentsPending > 0,
    },
    {
      key: "services",
      labelAr: "الخدمات النشطة",
      value: stats.servicesActive,
      hint: `${stats.services} خدمة متوفرة`,
      icon: Scissors,
    },
    {
      key: "offers",
      labelAr: "العروض النشطة",
      value: stats.offersActive,
      hint: "عروض الباقات والـ VIP",
      icon: Tag,
    },
    {
      key: "branches",
      labelAr: "فروع الصالون",
      value: stats.branches,
      hint: "فروع ومواقع الخريطة",
      icon: MapPin,
    },
    {
      key: "gallery",
      labelAr: "صور المعرض",
      value: stats.gallery,
      hint: "صور السلايدر",
      icon: ImageIcon,
    },
    {
      key: "barbers",
      labelAr: "فريق العمل",
      value: stats.barbers,
      hint: "الحلاقين والأخصائيين",
      icon: Users,
    },
    {
      key: "testimonials",
      labelAr: "آراء العملاء",
      value: stats.testimonials,
      hint: "التقييمات والتوصيات",
      icon: Star,
    },
  ];

  return (
    <div className="space-y-6">
      {/* حالة الاتصال والترحيب */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#c9a227]/30 bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414] p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-[#f5f0e6]">
            مرحباً بك في لوحة تحكم <span className="text-[#c9a227]">صالون صدام</span>
          </h2>
          <p className="mt-1 text-xs text-[#f5f0e6]/60">
            يمكنك إدارة الخدمات، الأسعار، العروض، الفروع، الصور وجميع نصوص الموقع
            بسهولة من هذه اللوحة
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-bold text-green-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>قاعدة البيانات متصلة وجاهزة</span>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.key}
            onClick={() => onOpenTab(card.key)}
            className={`group rounded-2xl border p-5 text-right transition-all hover:scale-[1.02] ${
              card.highlight
                ? "border-[#c9a227] bg-[#c9a227]/10 ring-1 ring-[#c9a227]"
                : "border-[#c9a227]/20 bg-[#141414] hover:border-[#c9a227]/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-[#f5f0e6]">{card.value}</span>
              <div className="rounded-xl border border-[#c9a227]/20 bg-[#c9a227]/10 p-2 text-[#c9a227] transition group-hover:bg-[#c9a227] group-hover:text-[#0f0f0f]">
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-[#c9a227]">{card.labelAr}</p>
            <p className="mt-1 text-[11px] text-[#f5f0e6]/45">{card.hint}</p>
          </button>
        ))}
      </div>

      {/* إجراءات سريعة */}
      <div className="rounded-2xl border border-[#c9a227]/20 bg-[#141414] p-5">
        <h3 className="mb-3 text-sm font-bold text-[#c9a227]">إجراءات سريعة</h3>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onOpenTab("services")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/30 bg-[#0f0f0f] px-4 py-2 text-xs font-bold text-[#f5f0e6] transition hover:border-[#c9a227] hover:text-[#c9a227]"
          >
            <PlusCircle className="h-3.5 w-3.5 text-[#c9a227]" />
            إضافة خدمة جديدة
          </button>
          <button
            onClick={() => onOpenTab("offers")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/30 bg-[#0f0f0f] px-4 py-2 text-xs font-bold text-[#f5f0e6] transition hover:border-[#c9a227] hover:text-[#c9a227]"
          >
            <Tag className="h-3.5 w-3.5 text-[#c9a227]" />
            إضافة عرض خاص
          </button>
          <button
            onClick={() => onOpenTab("media")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/30 bg-[#0f0f0f] px-4 py-2 text-xs font-bold text-[#f5f0e6] transition hover:border-[#c9a227] hover:text-[#c9a227]"
          >
            <FolderOpen className="h-3.5 w-3.5 text-[#c9a227]" />
            رفع صور لـ Supabase Storage
          </button>
          <button
            onClick={() => onOpenTab("settings")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/30 bg-[#0f0f0f] px-4 py-2 text-xs font-bold text-[#f5f0e6] transition hover:border-[#c9a227] hover:text-[#c9a227]"
          >
            <Settings className="h-3.5 w-3.5 text-[#c9a227]" />
            تعديل أرقام التواصل والسوشيال
          </button>
        </div>
      </div>

      {/* آخر الحجوزات */}
      <section className="rounded-2xl border border-[#c9a227]/20 bg-[#141414] p-5 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#c9a227]">أحدث طلبات الحجز</h3>
            <p className="text-xs text-[#f5f0e6]/50">
              الحجوزات الواردة من موقع الصالون
            </p>
          </div>
          <button
            onClick={() => onOpenTab("appointments")}
            className="text-xs font-bold text-[#c9a227] hover:underline"
          >
            عرض جميع الحجوزات ←
          </button>
        </div>

        {stats.latestAppointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#f5f0e6]/50">
            لا توجد حجوزات مسجلة بعد
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-[#c9a227]/10 text-[#c9a227]">
                <tr>
                  <th className="pb-2.5 font-bold">اسم العميل</th>
                  <th className="pb-2.5 font-bold">رقم الهاتف</th>
                  <th className="pb-2.5 font-bold">ميعاد الحجز</th>
                  <th className="pb-2.5 font-bold">الحالة</th>
                  <th className="pb-2.5 font-bold">تواصل سريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9a227]/10">
                {stats.latestAppointments.map((appointment) => {
                  const statusInfo =
                    statusLabels[appointment.status] || {
                      label: appointment.status,
                      color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
                    };
                  const cleanPhone = appointment.customerPhone.replace(/[^0-9]/g, "");

                  return (
                    <tr key={appointment.id} className="text-[#f5f0e6]/90">
                      <td className="py-3 font-bold text-[#f5f0e6]">
                        {appointment.customerName}
                      </td>
                      <td className="py-3" dir="ltr">
                        {appointment.customerPhone}
                      </td>
                      <td className="py-3">
                        {new Date(appointment.appointmentDate).toLocaleString(
                          "ar-EG",
                          { dateStyle: "short", timeStyle: "short" }
                        )}
                      </td>
                      <td className="py-3">
                        <select
                          value={appointment.status}
                          onChange={(e) =>
                            void updateAppointmentStatus(
                              appointment.id,
                              e.target.value
                            )
                          }
                          className={`rounded-lg border px-2 py-1 text-[11px] font-bold outline-none ${statusInfo.color}`}
                        >
                          <option value="pending">في الانتظار</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="completed">تم التنفيذ</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/10 px-2 py-1 text-[11px] font-bold text-green-400 hover:bg-green-500/20"
                            title="مراسلة واتساب"
                          >
                            <MessageCircle className="h-3 w-3" />
                            واتساب
                          </a>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 px-2 py-1 text-[11px] font-bold text-[#c9a227] hover:bg-[#c9a227]/20"
                            title="اتصال هاتفي"
                          >
                            <Phone className="h-3 w-3" />
                            اتصال
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
