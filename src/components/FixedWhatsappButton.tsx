import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/data/site-config";

export default function FixedWhatsappButton() {
  const link = whatsappLink(
    "السلام عليكم، عايز أحجز موعد في صالون صدام",
  );

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="احجز على واتساب"
      className="fixed bottom-4 start-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-[#071b0d] shadow-[0_8px_30px_rgba(37,211,102,0.3)] transition-transform hover:scale-105 sm:bottom-6 sm:start-6 sm:px-5 sm:py-3.5"
    >
      <MessageCircle className="h-5 w-5" />
      <span>احجز على واتساب</span>
    </a>
  );
}
