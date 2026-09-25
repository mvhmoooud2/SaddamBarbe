"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Scissors } from "lucide-react";

const navLinks = [
  { href: "#home", label: "الرئيسية" },
  { href: "#services", label: "الخدمات" },
  { href: "#offers", label: "العروض" },
  { href: "#gallery", label: "معرض الصور" },
  { href: "#team", label: "الفريق" },
  { href: "#booking", label: "احجز موعد" },
  { href: "#testimonials", label: "آراء العملاء" },
  { href: "#contact", label: "تواصل معنا" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-[#0f0f0f]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-[#c9a227]" />
          <span className="text-xl font-bold tracking-wider text-[#f5f0e6]">
            SADDAM <span className="text-[#c9a227]">BARBER</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#f5f0e6]/80 transition-colors hover:text-[#c9a227]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#booking"
          className="hidden rounded-full bg-[#c9a227] px-5 py-2 text-sm font-semibold text-[#0f0f0f] transition-transform hover:scale-105 md:inline-block"
        >
          احجز الآن
        </a>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#f5f0e6] md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[#c9a227]/20 bg-[#0f0f0f] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-[#f5f0e6]/80 transition-colors hover:text-[#c9a227]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#booking"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-full bg-[#c9a227] px-5 py-2 text-center text-sm font-semibold text-[#0f0f0f]"
            >
              احجز الآن
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
