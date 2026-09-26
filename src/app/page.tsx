import { connection } from "next/server";
import { loadSiteContent, staticContent } from "@/lib/content";
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

// كل محتوى الصفحة (الخدمات، العروض، الفروع، الصور، النصوص، أرقام التواصل)
// بيتحمّل من قاعدة البيانات علشان يتعدّل من لوحة التحكم /admin.
// في نسخة GitHub Pages أو لو الداتابيز مش متاحة بنستخدم البيانات الثابتة.
async function getContent() {
  if (process.env.STATIC_EXPORT === "1") return staticContent();
  await connection();
  return loadSiteContent();
}

export default async function HomePage() {
  const content = await getContent();
  const { services, offers, branches, gallery, testimonials, settings } = content;

  return (
    <>
      <Header settings={settings} />
      <main>
        <Hero settings={settings} />
        <Services services={services} branches={branches} settings={settings} />
        <Offers offers={offers} branches={branches} settings={settings} />
        <GallerySlider images={gallery} settings={settings} />
        <Branches branches={branches} settings={settings} />
        <BookingForm
          services={services}
          offers={offers}
          branches={branches}
          settings={settings}
        />
        <Testimonials
          branches={branches}
          testimonials={testimonials}
          settings={settings}
        />
      </main>
      <Footer branches={branches} settings={settings} />
      <FixedWhatsappButton settings={settings} />
    </>
  );
}
