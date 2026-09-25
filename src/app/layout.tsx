import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SADDAM BARBER | صالون صدام للحلاقة",
  description:
    "صالون صدام للحلاقة - تجربة حلاقة فاخرة مع خدمات عصرية واحترافية. احجز موعدك الآن.",
  keywords: ["barbershop", "حلاقة", "صالون", "Saddam Barber", "حلاق", "ذقن"],
  openGraph: {
    title: "SADDAM BARBER | صالون صدام للحلاقة",
    description:
      "صالون صدام للحلاقة - تجربة حلاقة فاخرة مع خدمات عصرية واحترافية.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#0f0f0f] text-[#f5f0e6] antialiased">{children}</body>
    </html>
  );
}
