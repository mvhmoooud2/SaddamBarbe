"use client";

import { CalendarClock, MessageCircle } from "lucide-react";
import { branchWhatsappLinkWithMessage, type Branch } from "@/data/branches";

/**
 * اسم الحدث اللي بينبث لما الزائر يضغط «احجز الخدمة» من كارت خدمة.
 * نموذج الحجز يقدر يلتقطه لو العميل قرر يكمل من الفورم.
 */
export const BOOK_SERVICE_EVENT = "saddam:book-service";

interface BookServiceButtonProps {
  serviceId: number;
  serviceName: string;
  branch: Branch;
}

export default function BookServiceButton({
  serviceId,
  serviceName,
  branch,
}: BookServiceButtonProps) {
  const message = `السلام عليكم، عايز أحجز خدمة ${serviceName} في ${branch.nameAr}.`;
  const link = branchWhatsappLinkWithMessage(branch, message);

  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent<{ serviceId: number; branchId: string }>(BOOK_SERVICE_EVENT, {
        detail: { serviceId, branchId: branch.id },
      }),
    );
  };

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-[#071b0d] transition-transform hover:scale-[1.02]"
    >
      <MessageCircle className="h-4 w-4" />
      <span>احجز الخدمة</span>
      <CalendarClock className="h-4 w-4" />
    </a>
  );
}
