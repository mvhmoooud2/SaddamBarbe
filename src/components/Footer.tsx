import Image from "next/image";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { branches as staticBranches, type Branch } from "@/data/branches";
import { asset } from "@/lib/base-path";
import {
  setting,
  whatsappLinkFromSettings,
  type SiteSettingsMap,
} from "@/lib/site-settings";

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

type FooterProps = {
  branches?: Branch[];
  settings?: SiteSettingsMap;
};

export default function Footer({
  branches = staticBranches,
  settings,
}: FooterProps) {
  const tiktok = setting(settings, "tiktok");

  return (
    <footer id="contact" className="border-t border-[#c9a227]/20 bg-[#0f0f0f] pt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center">
              <Image
                src={asset(setting(settings, "logoImage"))}
                alt={`شعار ${setting(settings, "siteNameAr")}`}
                width={225}
                height={64}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#f5f0e6]/70">
              {setting(settings, "footerAbout")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[#c9a227]">فروعنا والتواصل</h3>
            <ul className="space-y-5 text-sm text-[#f5f0e6]/80">
              {branches.map((branch) => (
                <li key={branch.id} className="space-y-1.5">
                  <p className="flex items-center gap-3 font-bold text-[#f5f0e6]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#c9a227]" />
                    <a href="#branches" className="transition-colors hover:text-[#c9a227]">
                      {branch.nameAr}
                    </a>
                  </p>
                  <p className="ps-7 text-xs leading-relaxed text-[#f5f0e6]/60">
                    {branch.addressAr}
                  </p>
                  <p className="flex items-center gap-3 ps-7">
                    <Phone className="h-4 w-4 shrink-0 text-[#c9a227]" />
                    <a
                      href={branch.phoneHref}
                      dir="ltr"
                      className="transition-colors hover:text-[#c9a227]"
                    >
                      {branch.phoneDisplay}
                    </a>
                  </p>
                  <p className="flex items-start gap-3 ps-7 text-xs text-[#f5f0e6]/60">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />
                    <span>{branch.hoursAr}</span>
                  </p>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 shrink-0 text-[#c9a227]" />
                <a
                  href={whatsappLinkFromSettings(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#c9a227]"
                >
                  احجز على واتساب
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[#c9a227]">تابعنا</h3>
            <div className="flex gap-4">
              <a
                href={setting(settings, "instagram")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a227]/30 text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href={setting(settings, "facebook")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a227]/30 text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              {tiktok && (
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a227]/30 text-xs font-black text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                  aria-label="TikTok"
                >
                  TT
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#c9a227]/10 py-6 text-center text-sm text-[#f5f0e6]/50">
          © {new Date().getFullYear()} {setting(settings, "siteNameEn")}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
