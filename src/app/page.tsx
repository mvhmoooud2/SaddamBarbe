import { connection } from "next/server";
import { db } from "@/db";
import { services, testimonials, offers } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  fallbackServices,
  fallbackTestimonials,
  fallbackOffers,
} from "@/data/fallback";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Offers from "@/components/Offers";
import Stats from "@/components/Stats";
import GallerySlider from "@/components/GallerySlider";
import BookingForm from "@/components/BookingForm";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

// ملاحظة مهمة:
// في التشغيل العادي الصفحة لازم تقرأ من قاعدة البيانات مع كل طلب، وبنعمل ده
// بنداء connection() جوه loadSiteData (ده بيخلي المسار dynamic من غير ما نحتاج
// سطر export const dynamic = "force-dynamic" اللي التصدير الثابت بيرفضه).
// في نسخة GitHub Pages الثابتة بنتخطى النداء ده لأن مفيش سيرفر أصلاً.

/** بيقرأ الداتا من الداتابيز، ولو الداتابيز مش متاحة بيستخدم البيانات الثابتة */
async function loadSiteData() {
  // النسخة الثابتة مالهاش قاعدة بيانات → نستخدم البيانات الثابتة على طول
  if (process.env.STATIC_EXPORT === "1") {
    return {
      servicesData: fallbackServices,
      testimonialsData: fallbackTestimonials,
      offersData: fallbackOffers,
    };
  }

  // بنستنى الطلب الفعلي علشان الصفحة تتولّد مع كل زيارة (بيانات حديثة دايماً)
  await connection();

  try {
    const [servicesData, testimonialsData, offersData] = await Promise.all([
      db
        .select()
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(services.id),
      db
        .select()
        .from(testimonials)
        .where(eq(testimonials.isActive, true))
        .orderBy(testimonials.id),
      db
        .select()
        .from(offers)
        .where(eq(offers.isActive, true))
        .orderBy(offers.id),
    ]);

    return { servicesData, testimonialsData, offersData };
  } catch (error) {
    console.warn(
      "[fallback] قاعدة البيانات غير متاحة، يتم استخدام البيانات الثابتة:",
      error
    );
    return {
      servicesData: fallbackServices,
      testimonialsData: fallbackTestimonials,
      offersData: fallbackOffers,
    };
  }
}

export default async function HomePage() {
  const { servicesData, testimonialsData, offersData } =
    await loadSiteData();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services services={servicesData} />
        <Offers offers={offersData} />
        <Stats />
        <GallerySlider />
        <BookingForm services={servicesData} />
        <Testimonials testimonials={testimonialsData} />
      </main>
      <Footer />
    </>
  );
}
