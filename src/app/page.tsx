import { connection } from "next/server";
import { db } from "@/db";
import { services, offers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fallbackServices, fallbackOffers } from "@/data/fallback";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Offers from "@/components/Offers";
import GallerySlider from "@/components/GallerySlider";
import Branches from "@/components/Branches";
import BookingForm from "@/components/BookingForm";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FixedWhatsappButton from "@/components/FixedWhatsappButton";

// في نسخة GitHub Pages بنتخطى قاعدة البيانات ونستخدم البيانات الثابتة.
// في التشغيل العادي الصفحة بتقرأ أحدث الخدمات والعروض، ولو قاعدة البيانات
// غير متاحة بنرجع تلقائياً للداتا الاحتياطية علشان الموقع يفضل شغال.
async function loadSiteData() {
  if (process.env.STATIC_EXPORT === "1") {
    return { servicesData: fallbackServices, offersData: fallbackOffers };
  }

  await connection();

  try {
    const [servicesData, offersData] = await Promise.all([
      db
        .select()
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(services.id),
      db
        .select()
        .from(offers)
        .where(eq(offers.isActive, true))
        .orderBy(offers.id),
    ]);

    return { servicesData, offersData };
  } catch (error) {
    console.warn(
      "[fallback] قاعدة البيانات غير متاحة، يتم استخدام البيانات الثابتة:",
      error,
    );
    return { servicesData: fallbackServices, offersData: fallbackOffers };
  }
}

export default async function HomePage() {
  const { servicesData, offersData } = await loadSiteData();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services services={servicesData} />
        <Offers offers={offersData} />
        <GallerySlider />
        <Branches />
        <BookingForm services={servicesData} offers={offersData} />
        <Testimonials />
      </main>
      <Footer />
      <FixedWhatsappButton />
    </>
  );
}
