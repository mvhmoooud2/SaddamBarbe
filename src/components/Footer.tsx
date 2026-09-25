import { Scissors, Phone, MapPin, Clock } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-[#c9a227]/20 bg-[#0f0f0f] pt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-[#c9a227]" />
              <span className="text-xl font-bold tracking-wider">
                SADDAM <span className="text-[#c9a227]">BARBER</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#f5f0e6]/70">
              صالون صدام للحلاقة يقدم تجربة حلاقة فاخرة بأيدي محترفين. نحرص على
              كل تفصيل لنمنحك المظهر الأنيق الذي تستحقه.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[#c9a227]">معلومات التواصل</h3>
            <ul className="space-y-3 text-sm text-[#f5f0e6]/80">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#c9a227]" />
                <span>+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#c9a227]" />
                <span>شارع التحرير، القاهرة، مصر</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#c9a227]" />
                <span>يومياً من 10:00 صباحاً حتى 10:00 مساءً</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[#c9a227]">تابعنا</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a227]/30 text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a227]/30 text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#c9a227]/10 py-6 text-center text-sm text-[#f5f0e6]/50">
          © {new Date().getFullYear()} SADDAM BARBER. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
