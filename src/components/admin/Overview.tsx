"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Scissors,
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
  latestAppointments: {
    id: number;
    customerName: string;
    customerPhone: string;
    appointmentDate: string;
    status: string;
  }[];
};

const statusLabels: Record<string, string> = {
  pending: "في الانتظار",
  confirmed: "مؤكد",
  completed: "تم",
  cancelled: "ملغي",
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

  if (error) {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center py-16 text-[#c9a227]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      key: "appointments",
      labelAr: "حجوزات في الانتظار",
      value: stats.appointmentsPending,
      hint: `${stats.appointments} حجز إجمالي`,
      icon: CalendarClock,
      highlight: stats.appointmentsPending > 0,
    },
    {
      key: "services",
      labelAr: "خدمات ظاهرة",
      value: stats.servicesActive,
      hint: `${stats.services} خدمة في قاعدة البيانات`,
      icon: Scissors,
    },
    {
      key: "offers",
      labelAr: "عروض شغالة",
      value: stats.offersActive,
      hint: "العروض الظاهرة للعميل",
      icon: Tag,
    },
    {
      key: "branches",
      labelAr: "الفروع",
      value: stats.branches,
      hint: "الفروع الظاهرة على الموقع",
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
      labelAr: "الفريق",
      value: stats.barbers,
      hint: "الحلاقين المسجّلين",
      icon: Users,
    },
    {
      key: "testimonials",
      labelAr: "آراء العملاء",
      value: stats.testimonials,
      hint: "الآراء المكتوبة",
      icon: Star,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#f5f0e6]">نظرة عامة</h2>
        <p className="text-xs text-[#f5f0e6]/50">
          ملخص سريع لكل حاجة على الموقع — دوس على أي كارت علشان تعدّله
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.key}
            onClick={() => onOpenTab(card.key)}
            className={`rounded-2xl border p-5 text-right transition-colors ${
              card.highlight
                ? "border-[#c9a227] bg-[#c9a227]/10"
                : "border-[#c9a227]/20 bg-[#1a1a1a] hover:border-[#c9a227]/50"
            }`}
          >
            <card.icon className="mb-3 h-5 w-5 text-[#c9a227]" />
            <p className="text-3xl font-black text-[#f5f0e6]">{card.value}</p>
            <p className="mt-1 text-sm font-bold text-[#c9a227]">{card.labelAr}</p>
            <p className="mt-1 text-[11px] text-[#f5f0e6]/45">{card.hint}</p>
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-[#c9a227]/20 bg-[#1a1a1a] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-[#c9a227]">آخر الحجوزات</h3>
          <button
            onClick={() => onOpenTab("appointments")}
            className="text-xs font-bold text-[#f5f0e6]/60 hover:text-[#c9a227]"
          >
            كل الحجوزات ←
          </button>
        </div>

        {stats.latestAppointments.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#f5f0e6]/50">
            مفيش حجوزات لسه
          </p>
        ) : (
          <ul className="divide-y divide-[#c9a227]/10">
            {stats.latestAppointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-bold text-[#f5f0e6]">
                    {appointment.customerName}
                  </p>
                  <p className="text-xs text-[#f5f0e6]/50" dir="ltr">
                    {appointment.customerPhone}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-[#f5f0e6]/70">
                    {new Date(appointment.appointmentDate).toLocaleString("ar-EG", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  <span className="text-[11px] font-bold text-[#c9a227]">
                    {statusLabels[appointment.status] ?? appointment.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
