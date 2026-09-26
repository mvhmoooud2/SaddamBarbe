"use client";

import { CalendarClock } from "lucide-react";

/**
 * اسم الحدث اللي بينبث لما الزائر يضغط «احجز هذه الخدمة» من كارت خدمة.
 * نموذج الحجز (قسم #booking) بيسمع الحدث ده وبتحدد الخدمة دي
 * تلقائياً في قائمة «الخدمة» جوه الفورم.
 */
export const BOOK_SERVICE_EVENT = "saddam:book-service";

interface BookServiceButtonProps {
  /** معرّف الخدمة اللي هتتحدد تلقائياً في نموذج الحجز */
  serviceId: number;
}

/**
 * زر الحجز اللي تحت كل خدمة: بينزل بسرعة لقسم الحجز،
 * وفي نفس الوقت بيبلّغ الفورم يحدد الخدمة دي على طول.
 *
 * (الرابط `#booking` شغال حتى لو الجافاسكريبت مقفول —
 * بس وقتها من غير تحديد الخدمة تلقائياً.)
 */
export default function BookServiceButton({
  serviceId,
}: BookServiceButtonProps) {
  const handleClick = () => {
    // بنبعت معرّف الخدمة قبل ما المتصفح ينزّل لقسم الحجز،
    // علشان الفورم يلاقي الخدمة محددة وجاهزة
    window.dispatchEvent(
      new CustomEvent<number>(BOOK_SERVICE_EVENT, { detail: serviceId })
    );
  };

  return (
    <a
      href="#booking"
      onClick={handleClick}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 px-5 py-3 text-sm font-bold text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
    >
      <CalendarClock className="h-4 w-4" />
      احجز هذه الخدمة
    </a>
  );
}
