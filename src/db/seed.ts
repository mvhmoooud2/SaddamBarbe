import "dotenv/config";
import { db } from "./index";
import { services, barbers, testimonials, offers } from "./schema";

async function seed() {
  await db.delete(testimonials);
  await db.delete(barbers);
  await db.delete(services);
  await db.delete(offers);

  await db.insert(services).values([
    {
      nameAr: "قصة شعر",
      nameEn: "Haircut",
      descriptionAr: "قصة شعر عصرية تناسب وجهك مع غسيل شامل.",
      descriptionEn: "A modern haircut tailored to your face shape with a full wash.",
      price: "80.00",
      durationMinutes: 45,
      imageUrl: "/images/service-haircut.jpg",
      isActive: true,
    },
    {
      nameAr: "حلاقة الذقن",
      nameEn: "Beard Trim",
      descriptionAr: "تهذيب الذقن وتشكيلها باحترافية عالية.",
      descriptionEn: "Professional beard trimming and shaping.",
      price: "50.00",
      durationMinutes: 30,
      imageUrl: "/images/service-beard.jpg",
      isActive: true,
    },
    {
      nameAr: "قصة شعر + ذقن",
      nameEn: "Haircut + Beard",
      descriptionAr: "باقة كاملة للحصول على مظهر أنيق وجذاب.",
      descriptionEn: "A complete package for a sharp, attractive look.",
      price: "120.00",
      durationMinutes: 75,
      imageUrl: "/images/service-combo.jpg",
      isActive: true,
    },
    {
      nameAr: "تنظيف البشرة",
      nameEn: "Facial Cleansing",
      descriptionAr: "تنظيف عميق للبشرة بالمنتجات المناسبة.",
      descriptionEn: "Deep skin cleansing with suitable products.",
      price: "100.00",
      durationMinutes: 60,
      imageUrl: "/images/service-facial.jpg",
      isActive: true,
    },
    {
      nameAr: "صبغة شعر",
      nameEn: "Hair Coloring",
      descriptionAr: "ألوان عصرية بجودة عالية وثبات طويل.",
      descriptionEn: "Modern colors with high quality and long-lasting results.",
      price: "150.00",
      durationMinutes: 90,
      imageUrl: "/images/service-coloring.jpg",
      isActive: true,
    },
    {
      nameAr: "مساج الرأس",
      nameEn: "Head Massage",
      descriptionAr: "مساج استرخائي للرأس والرقبة.",
      descriptionEn: "Relaxing head and neck massage.",
      price: "60.00",
      durationMinutes: 30,
      imageUrl: "/images/service-massage.jpg",
      isActive: true,
    },
  ]);

  await db.insert(barbers).values([
    {
      nameAr: "صدّام",
      nameEn: "Saddam",
      roleAr: "مالك وكبير الحلاقين",
      roleEn: "Owner & Master Barber",
      bioAr: "خبرة أكثر من 15 عاماً في فن الحلاقة والعناية بالرجل.",
      bioEn: "Over 15 years of experience in the art of barbering and men's grooming.",
      imageUrl: "/images/barber-saddam.jpg",
      isActive: true,
    },
    {
      nameAr: "أحمد",
      nameEn: "Ahmed",
      roleAr: "حلاق محترف",
      roleEn: "Professional Barber",
      bioAr: "متخصص في القصات العصرية والتفاصيل الدقيقة.",
      bioEn: "Specialized in modern cuts and fine details.",
      imageUrl: "/images/barber-ahmed.jpg",
      isActive: true,
    },
    {
      nameAr: "محمد",
      nameEn: "Mohamed",
      roleAr: "حلاق ذقون",
      roleEn: "Beard Specialist",
      bioAr: "خبير في تهذيب وتشكيل الذقن بأحدث الطرق.",
      bioEn: "Expert in beard trimming and shaping with the latest techniques.",
      imageUrl: "/images/barber-mohamed.jpg",
      isActive: true,
    },
  ]);

  await db.insert(testimonials).values([
    {
      customerName: "عمر خالد",
      commentAr: "أفضل صالون حلاقة زرته على الإطلاق. الخدمة ممتازة والأجواء رائعة.",
      commentEn: "The best barbershop I've ever visited. Excellent service and great atmosphere.",
      rating: 5,
      isActive: true,
    },
    {
      customerName: "كريم محمود",
      commentAr: "صدّام يعرف شغله كويس جداً. القصة طلعت زي ما كنت عايزها بالظبط.",
      commentEn: "Saddam really knows his craft. The cut came out exactly as I wanted.",
      rating: 5,
      isActive: true,
    },
    {
      customerName: "يوسف سامي",
      commentAr: "نظافة واحترافية عالية. سعر مناسب جداً مقابل الجودة.",
      commentEn: "High cleanliness and professionalism. Very fair price for the quality.",
      rating: 4,
      isActive: true,
    },
  ]);

  await db.insert(offers).values([
    {
      titleAr: "عرض قصة الشعر والذقن",
      titleEn: "Haircut + Beard Offer",
      descriptionAr: "الباقة الأشهر في الصالون بسعر خاص لفترة محدودة.",
      descriptionEn: "Our most popular package at a special price for a limited time.",
      detailsAr: [
        "قصة شعر عصرية تناسب شكل وجهك.",
        "تهذيب وتشكيل الذقن بالكامل.",
        "غسيل الشعر بالشامبو والبلسم.",
        "منتج تصفيف مجاني من اختيارك.",
        "العرض ساري طوال أيام الأسبوع حتى نفاذ المواعيد.",
      ].join("\n"),
      oldPrice: "120.00",
      newPrice: "89.00",
      imageUrl: "/images/offer-1.jpg",
      badgeAr: "الأكثر طلباً",
      validUntil: new Date("2026-12-31T23:59:59"),
      isActive: true,
    },
    {
      titleAr: "عرض تنظيف البشرة",
      titleEn: "Facial Cleansing Offer",
      descriptionAr: "بشرة نقية ومنعشة في جلسة واحدة بسعر مخفّض.",
      descriptionEn: "Clear, fresh skin in a single session at a reduced price.",
      detailsAr: [
        "تنظيف عميق للبشرة وإزالة الرؤوس السوداء.",
        "قناع مرطب ومنعش للوجه.",
        "تدليك خفيف لتنشيط الدورة الدموية.",
        "مناسب لجميع أنواع البشرة.",
        "مدة الجلسة 60 دقيقة فقط.",
      ].join("\n"),
      oldPrice: "100.00",
      newPrice: "69.00",
      imageUrl: "/images/offer-2.jpg",
      badgeAr: "خصم 31%",
      validUntil: new Date("2026-11-30T23:59:59"),
      isActive: true,
    },
    {
      titleAr: "عرض صبغة الشعر",
      titleEn: "Hair Coloring Offer",
      descriptionAr: "لون جديد يدوم طويلاً بأسعار لا تُقاوم.",
      descriptionEn: "A long-lasting new color at irresistible prices.",
      detailsAr: [
        "صبغة بألوان عصرية وجودة عالية.",
        "ثبات طويل يدوم حتى 6 أسابيع.",
        "منتجات آمنة وغير ضارة بالشعر.",
        "استشارة مجانية لاختيار اللون المناسب.",
        "يشمل الغسيل والتصفيف بعد الصبغة.",
      ].join("\n"),
      oldPrice: "150.00",
      newPrice: "99.00",
      imageUrl: "/images/offer-3.jpg",
      badgeAr: "عرض محدود",
      validUntil: new Date("2026-10-31T23:59:59"),
      isActive: true,
    },
    {
      titleAr: "عرض مساج الرأس",
      titleEn: "Head Massage Offer",
      descriptionAr: "استرخاء تام بعد يوم طويل شاق.",
      descriptionEn: "Total relaxation after a long, tiring day.",
      detailsAr: [
        "مساج استرخائي للرأس والرقبة.",
        "زيوت طبيعية معطرة.",
        "تخفيف التوتر وتحسين جودة النوم.",
        "جلسة لمدة 30 دقيقة.",
        "يمكن إضافتها لأي خدمة أخرى بسعر 25 ج.م فقط.",
      ].join("\n"),
      oldPrice: "60.00",
      newPrice: "39.00",
      imageUrl: "/images/offer-4.jpg",
      badgeAr: "جديد",
      validUntil: new Date("2026-12-15T23:59:59"),
      isActive: true,
    },
    {
      titleAr: "عرض القصة الكلاسيكية",
      titleEn: "Classic Haircut Offer",
      descriptionAr: "أناقة كلاسيكية بسعر مناسب جداً.",
      descriptionEn: "Classic elegance at a very affordable price.",
      detailsAr: [
        "قصة كلاسيكية بالماكينة والمقص.",
        "تحديد الخطوط بدقة عالية.",
        "غسيل وتجفيف الشعر.",
        "مناسبة للعمل والمناسبات.",
        "العرض متاح طوال أيام الأسبوع.",
      ].join("\n"),
      oldPrice: "80.00",
      newPrice: "55.00",
      imageUrl: "/images/offer-5.jpg",
      badgeAr: "سعر مميز",
      validUntil: new Date("2026-12-31T23:59:59"),
      isActive: true,
    },
    {
      titleAr: "باقة العريس",
      titleEn: "Groom Package",
      descriptionAr: "جاهز بأفضل شكل في يوم فرحتك.",
      descriptionEn: "Look your absolute best on your big day.",
      detailsAr: [
        "قصة شعر + تهذيب وتشكيل الذقن.",
        "تنظيف بشرة كامل للوجه.",
        "صبغة شعر إن رغبت في ذلك.",
        "جلسة مساج للرأس والكتفين.",
        "أولوية في اختيار المواعيد يوم الزفاف.",
      ].join("\n"),
      oldPrice: "300.00",
      newPrice: "199.00",
      imageUrl: "/images/offer-6.jpg",
      badgeAr: "وفّر 101 ج.م",
      validUntil: new Date("2027-01-31T23:59:59"),
      isActive: true,
    },
  ]);

  console.log("Database seeded successfully");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
