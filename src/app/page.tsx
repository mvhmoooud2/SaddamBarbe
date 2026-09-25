import { db } from "@/db";
import { services, barbers, testimonials, offers } from "@/db/schema";
import { eq } from "drizzle-orm";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Offers from "@/components/Offers";
import Stats from "@/components/Stats";
import GallerySlider from "@/components/GallerySlider";
import Team from "@/components/Team";
import BookingForm from "@/components/BookingForm";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [servicesData, barbersData, testimonialsData, offersData] = await Promise.all([
    db.select().from(services).where(eq(services.isActive, true)).orderBy(services.id),
    db.select().from(barbers).where(eq(barbers.isActive, true)).orderBy(barbers.id),
    db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(testimonials.id),
    db.select().from(offers).where(eq(offers.isActive, true)).orderBy(offers.id),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services services={servicesData} />
        <Offers offers={offersData} />
        <Stats />
        <GallerySlider />
        <Team barbers={barbersData} />
        <BookingForm services={servicesData} barbers={barbersData} />
        <Testimonials testimonials={testimonialsData} />
      </main>
      <Footer />
    </>
  );
}
