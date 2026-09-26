// بيانات الموقع الأساسية (مصدر وحيد للداتا)
// تُستخدم في: زرع قاعدة البيانات (src/db/seed.ts) + البيانات الاحتياطية لو الداتابيز مش متاحة
import type {
  NewService,
  NewBarber,
  NewTestimonial,
  NewOffer,
} from "@/db/schema";

/**
 * قائمة خدمات الصالون وأسعارها.
 *
 * الأسعار دي مطابقة لـ«قائمة أسعار فرع مدينة نصر» (صورة القائمة محفوظة في
 * public/images/prices-nasr-city.jpg وبتتعرض في كارت الفرع في قسم «فروعنا»).
 * أسعار فرع حدائق القبة ممكن تختلف — وده مكتوب صريح في ملاحظة تحت كروت
 * قسم «خدماتنا وأسعارنا» مع رقم الفرع.
 *
 * الترتيب هنا هو نفس ترتيب الأقسام في القائمة:
 *   1) خدمات الشعر واللحية  2) العناية بالبشرة  3) وكس وإزالة الشعر
 *   4) صبغات وتجميل         5) العناية بالشعر   6) باديكير
 *   7) سبا واسترخاء         8) المساج
 *
 * ملاحظات:
 *   • القائمة بتحدد مدة المساج بس (45 و60 دقيقة)، وباقي المدد تقديرية ومكتوبة
 *     على أساس المدة المعتادة لكل خدمة — عدّلها من هنا لو محتاج.
 *   • خدمات البروتين/الكافيار/بونكس/الكيراتين سعرها بالجرام (زي ما هو مكتوب
 *     في القائمة)، وعشان كده اسم الخدمة ووصفها بيوضّحوا إن السعر لكل جرام.
 *   • الصور كلها من public/images (مفيش صور مخصصة لكل خدمة جديدة لحد الآن).
 */
export const servicesData: NewService[] = [
  // ===== 1) خدمات الشعر واللحية =====
  {
    nameAr: "قص شعر (فوطة سخنة وفوطة ساقعه)",
    nameEn: "Haircut (Hot & Cold Towel)",
    descriptionAr:
      "قص شعر احترافي يناسب شكل وجهك، مع فوطة سخنة قبل القص وفوطة ساقعه بعده.",
    descriptionEn:
      "A professional haircut for your face shape, with a hot towel before and a cold towel after.",
    price: "250.00",
    durationMinutes: 45,
    imageUrl: "/images/service-haircut.jpg",
    isActive: true,
  },
  {
    nameAr: "قص أطفال",
    nameEn: "Kids Haircut",
    descriptionAr: "قصة شعر مريحة وسريعة للأطفال بتعامل هادي وسعر مناسب.",
    descriptionEn: "A comfortable, quick haircut for kids at a friendly price.",
    price: "200.00",
    durationMinutes: 30,
    imageUrl: "/images/service-haircut.jpg",
    isActive: true,
  },
  {
    nameAr: "دقن بخار",
    nameEn: "Steam Beard Shave",
    descriptionAr:
      "حلاقة وتشكيل الذقن بالبخار لفتح المسام، بتمريرة ناعمة ومن غير تهيج.",
    descriptionEn:
      "Steam shave for a close, smooth beard line without irritation.",
    price: "200.00",
    durationMinutes: 30,
    imageUrl: "/images/service-beard.jpg",
    isActive: true,
  },
  {
    nameAr: "دقن (فوطة ساقعة)",
    nameEn: "Beard Shave (Cold Towel)",
    descriptionAr: "تهذيب وتشكيل الذقن بدقة عالية مع فوطة ساقعة بعد الحلاقة.",
    descriptionEn: "Precise beard trimming and shaping with a cold towel finish.",
    price: "150.00",
    durationMinutes: 25,
    imageUrl: "/images/service-beard.jpg",
    isActive: true,
  },
  {
    nameAr: "شعر + دقن + سكرب + حمام كريم",
    nameEn: "Haircut + Beard + Scrub + Cream Bath",
    descriptionAr:
      "الباقة الكاملة: قصة شعر وذقن مع سكرب للوجه وفوطتين (سخنة وساقعة) وحمام كريم.",
    descriptionEn:
      "The full package: haircut and beard with a face scrub, hot and cold towels, and a cream bath.",
    price: "500.00",
    durationMinutes: 90,
    imageUrl: "/images/service-combo.jpg",
    isActive: true,
  },
  {
    nameAr: "شوار",
    nameEn: "Blow Dry",
    descriptionAr: "تسريح وتجفيف الشعر بالسيشوار بلمسة نهائية مرتبة.",
    descriptionEn: "Hair drying and styling with a neat finishing touch.",
    price: "150.00",
    durationMinutes: 20,
    imageUrl: "/images/gallery-6.jpg",
    isActive: true,
  },

  // ===== 2) العناية بالبشرة =====
  {
    nameAr: "بشرة VIP",
    nameEn: "VIP Facial",
    descriptionAr:
      "تنظيف وتفتيح البشرة بمنتجات فاخرة مع ماسك وترطيب عميق ونتيجة واضحة من أول جلسة.",
    descriptionEn:
      "Luxury facial cleansing and brightening with a mask and deep hydration.",
    price: "500.00",
    durationMinutes: 60,
    imageUrl: "/images/service-facial.jpg",
    isActive: true,
  },
  {
    nameAr: "هيدروفاشيال 7 مراحل",
    nameEn: "Hydrafacial (7 Steps)",
    descriptionAr:
      "جلسة هيدروفاشيال بـ7 مراحل لتنظيف البشرة وإزالة الرؤوس السوداء وتجديد النضارة.",
    descriptionEn:
      "A 7-step hydrafacial that deep-cleans the skin and restores its glow.",
    price: "800.00",
    durationMinutes: 60,
    imageUrl: "/images/gallery-3.jpg",
    isActive: true,
  },
  {
    nameAr: "هيدروفاشيال 11 مرحلة",
    nameEn: "Hydrafacial (11 Steps)",
    descriptionAr:
      "الجلسة الأشمل بـ11 مرحلة عناية بالبشرة، لنتيجة أعمق وثبات أطول.",
    descriptionEn:
      "Our most complete skin treatment with 11 steps for deeper, longer-lasting results.",
    price: "1200.00",
    durationMinutes: 75,
    imageUrl: "/images/gallery-1.jpg",
    isActive: true,
  },

  // ===== 3) وكس وإزالة الشعر =====
  {
    nameAr: "وكس كامل",
    nameEn: "Full Body Wax",
    descriptionAr: "إزالة الشعر بالشمع للجسم بالكامل بمنتجات لطيفة على البشرة.",
    descriptionEn: "Full-body waxing with products that are gentle on the skin.",
    price: "200.00",
    durationMinutes: 45,
    imageUrl: "/images/gallery-2.jpg",
    isActive: true,
  },
  {
    nameAr: "وكس عادي",
    nameEn: "Regular Wax",
    descriptionAr: "وكس سريع للمناطق المطلوبة بسعر مناسب.",
    descriptionEn: "A quick wax for the requested areas at a fair price.",
    price: "150.00",
    durationMinutes: 30,
    imageUrl: "/images/gallery-2.jpg",
    isActive: true,
  },

  // ===== 4) صبغات وتجميل =====
  {
    nameAr: "صبغة شعر",
    nameEn: "Hair Coloring",
    descriptionAr: "ألوان عصرية بجودة عالية وثبات طويل ومنتجات آمنة على الشعر.",
    descriptionEn:
      "Modern colors with high quality, long-lasting hold and safe products.",
    price: "300.00",
    durationMinutes: 90,
    imageUrl: "/images/service-coloring.jpg",
    isActive: true,
  },
  {
    nameAr: "توبيك",
    nameEn: "Toppik (Hair Coverage)",
    descriptionAr:
      "تغطية فراغات الشعر والمناطق الخفيفة ببودرة توبيك بلون مطابق لشعرك.",
    descriptionEn:
      "Covering thin patches with toppik powder in a shade that matches your hair.",
    price: "150.00",
    durationMinutes: 30,
    imageUrl: "/images/service-coloring.jpg",
    isActive: true,
  },

  // ===== 5) العناية بالشعر =====
  {
    nameAr: "حمام زيت",
    nameEn: "Hot Oil Bath",
    descriptionAr: "حمام زيت دافئ لترطيب الشعر وتغذيته من الجذور للأطراف.",
    descriptionEn: "A warm oil treatment that nourishes hair from root to tip.",
    price: "200.00",
    durationMinutes: 30,
    imageUrl: "/images/gallery-5.jpg",
    isActive: true,
  },
  {
    nameAr: "حمام زيت أمبول",
    nameEn: "Ampoule Oil Bath",
    descriptionAr:
      "حمام زيت بأمبول مركز لعلاج الشعر التالف وإرجاع الحيوية واللمعان.",
    descriptionEn:
      "An oil bath with a concentrated ampoule to repair damaged hair and restore shine.",
    price: "350.00",
    durationMinutes: 45,
    imageUrl: "/images/gallery-4.jpg",
    isActive: true,
  },
  {
    nameAr: "جلسة ترميم شعر",
    nameEn: "Hair Repair Session",
    descriptionAr:
      "جلسة علاجية لترميم الشعر التالف وتقوية البصيلات وتقليل التساقط.",
    descriptionEn:
      "A treatment session that repairs damaged hair, strengthens follicles and reduces hair fall.",
    price: "500.00",
    durationMinutes: 60,
    imageUrl: "/images/gallery-6.jpg",
    isActive: true,
  },
  {
    nameAr: "فرد أمريكي",
    nameEn: "American Hair Straightening",
    descriptionAr: "فرد الشعر بالطريقة الأمريكية لشعر ناعم ومفرود بشكل طبيعي.",
    descriptionEn: "American-style straightening for smooth, naturally straight hair.",
    price: "250.00",
    durationMinutes: 90,
    imageUrl: "/images/service-coloring.jpg",
    isActive: true,
  },
  {
    nameAr: "بروتين (السعر لكل جرام)",
    nameEn: "Protein Treatment (per gram)",
    descriptionAr:
      "علاج بالبروتين لتقوية الشعر وتنعيمه — السعر لكل جرام، والتكلفة النهائية حسب عدد الجرامات.",
    descriptionEn:
      "Protein treatment to strengthen and smooth hair — priced per gram, final cost depends on the amount used.",
    price: "70.00",
    durationMinutes: 120,
    imageUrl: "/images/gallery-6.jpg",
    isActive: true,
  },
  {
    nameAr: "كافيار (السعر لكل جرام)",
    nameEn: "Caviar Treatment (per gram)",
    descriptionAr:
      "علاج الكافيار لتغذية الشعر بعمق ولمعان صحي — السعر لكل جرام، والتكلفة النهائية حسب عدد الجرامات.",
    descriptionEn:
      "Caviar treatment for deep nourishment and healthy shine — priced per gram, final cost depends on the amount used.",
    price: "80.00",
    durationMinutes: 120,
    imageUrl: "/images/gallery-4.jpg",
    isActive: true,
  },
  {
    nameAr: "بونكس (السعر لكل جرام)",
    nameEn: "Bonx Treatment (per gram)",
    descriptionAr:
      "علاج بونكس لإعادة بناء الشعر التالف — السعر لكل جرام، والتكلفة النهائية حسب عدد الجرامات.",
    descriptionEn:
      "Bonx treatment to rebuild damaged hair — priced per gram, final cost depends on the amount used.",
    price: "85.00",
    durationMinutes: 120,
    imageUrl: "/images/gallery-1.jpg",
    isActive: true,
  },
  {
    nameAr: "كيراتين (السعر لكل جرام)",
    nameEn: "Keratin Treatment (per gram)",
    descriptionAr:
      "علاج الكيراتين لفرد وتنعيم الشعر — السعر لكل جرام، والتكلفة النهائية حسب عدد الجرامات.",
    descriptionEn:
      "Keratin treatment for straightening and smoothing — priced per gram, final cost depends on the amount used.",
    price: "60.00",
    durationMinutes: 120,
    imageUrl: "/images/service-coloring.jpg",
    isActive: true,
  },

  // ===== 6) باديكير =====
  {
    nameAr: "باديكير قدم",
    nameEn: "Pedicure",
    descriptionAr: "عناية كاملة بالقدمين: تنظيف وتقشير وترطيب وتشكيل الأظافر.",
    descriptionEn:
      "Complete foot care: cleansing, exfoliation, moisturizing and nail shaping.",
    price: "350.00",
    durationMinutes: 45,
    imageUrl: "/images/gallery-2.jpg",
    isActive: true,
  },
  {
    nameAr: "باديكير يد",
    nameEn: "Manicure",
    descriptionAr: "عناية كاملة باليدين: تقشير وترطيب وتهذيب الأظافر.",
    descriptionEn: "Complete hand care: exfoliation, moisturizing and nail care.",
    price: "250.00",
    durationMinutes: 30,
    imageUrl: "/images/gallery-2.jpg",
    isActive: true,
  },
  {
    nameAr: "باديكير علاجي (يد + قدم)",
    nameEn: "Therapeutic Manicure & Pedicure",
    descriptionAr:
      "برنامج علاجي متكامل لليدين والقدمين لعلاج الجفاف والتشققات وتشكيل الأظافر.",
    descriptionEn:
      "A complete therapeutic program for hands and feet that treats dryness and cracks.",
    price: "750.00",
    durationMinutes: 75,
    imageUrl: "/images/gallery-4.jpg",
    isActive: true,
  },

  // ===== 7) سبا واسترخاء =====
  {
    nameAr: "ساونا علاجي",
    nameEn: "Therapeutic Sauna",
    descriptionAr: "جلسة ساونا لفتح المسام وتنشيط الدورة الدموية وتهدئة الجسم.",
    descriptionEn: "A sauna session to open pores, boost circulation and relax the body.",
    price: "400.00",
    durationMinutes: 45,
    imageUrl: "/images/gallery-5.jpg",
    isActive: true,
  },
  {
    nameAr: "استيم + ليفة مغربي",
    nameEn: "Steam + Moroccan Loofah",
    descriptionAr:
      "جلسة بخار مع تقشير بالليفة المغربي لتنظيف الجسم بالكامل ونعومة فورية.",
    descriptionEn:
      "A steam session with a Moroccan loofah scrub for a full-body clean and instant smoothness.",
    price: "500.00",
    durationMinutes: 60,
    imageUrl: "/images/gallery-1.jpg",
    isActive: true,
  },
  {
    nameAr: "جاكوزي",
    nameEn: "Jacuzzi",
    descriptionAr: "جلسة جاكوزي مهدئة للعضلات بعد يوم طويل.",
    descriptionEn: "A calming jacuzzi session to soothe tired muscles.",
    price: "350.00",
    durationMinutes: 45,
    imageUrl: "/images/service-combo.jpg",
    isActive: true,
  },

  // ===== 8) المساج =====
  {
    nameAr: "مساج (45 دقيقة – مدرب)",
    nameEn: "Massage (45 min – Trained)",
    descriptionAr:
      "جلسة مساج 45 دقيقة على إيد مدرب، لاسترخاء العضلات وتخفيف التوتر.",
    descriptionEn:
      "A 45-minute massage by a trained therapist to relax muscles and release tension.",
    price: "650.00",
    durationMinutes: 45,
    imageUrl: "/images/service-massage.jpg",
    isActive: true,
  },
  {
    nameAr: "مساج (60 دقيقة)",
    nameEn: "Massage (60 min)",
    descriptionAr: "جلسة مساج كاملة 60 دقيقة لاسترخاء تام للجسم.",
    descriptionEn: "A full 60-minute massage session for total body relaxation.",
    price: "800.00",
    durationMinutes: 60,
    imageUrl: "/images/service-massage.jpg",
    isActive: true,
  },
];

export const barbersData: NewBarber[] = [
  {
    nameAr: "صدّام",
    nameEn: "Saddam",
    roleAr: "مالك وكبير الحلاقين",
    roleEn: "Owner & Master Barber",
    bioAr: "خبرة أكثر من 15 عاماً في فن الحلاقة والعناية بالرجل.",
    bioEn:
      "Over 15 years of experience in the art of barbering and men's grooming.",
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
];

export const testimonialsData: NewTestimonial[] = [
  {
    customerName: "عمر خالد",
    commentAr:
      "أفضل صالون حلاقة زرته على الإطلاق. الخدمة ممتازة والأجواء رائعة.",
    commentEn:
      "The best barbershop I've ever visited. Excellent service and great atmosphere.",
    rating: 5,
    isActive: true,
  },
  {
    customerName: "كريم محمود",
    commentAr: "الحلاق عارف شغله كويس جداً. القصة طلعت زي ما كنت عايزها بالظبط.",
    commentEn:
      "The barber really knows his craft. The cut came out exactly as I wanted.",
    rating: 5,
    isActive: true,
  },
  {
    customerName: "يوسف سامي",
    commentAr: "نظافة واحترافية عالية. سعر مناسب جداً مقابل الجودة.",
    commentEn:
      "High cleanliness and professionalism. Very fair price for the quality.",
    rating: 4,
    isActive: true,
  },
];

export const offersData: NewOffer[] = [
  {
    titleAr: "عرض العريس بـ 2900",
    titleEn: "Groom Package 2900",
    descriptionAr:
      "تجربة متكاملة تخليك في أفضل لوك وأعلى استرخاء قبل أهم يوم في حياتك.",
    descriptionEn:
      "A complete grooming and relaxation experience before the biggest day of your life.",
    detailsAr: [
      "قص شعر.",
      "دقن بخار.",
      "تنظيف بشرة (هيدروفيشال 12 مرحلة).",
      "وكس كامل.",
      "صبغة شعر.",
      "توبيك لفراغات الشعر.",
      "باديكير يد + بدكير قدم.",
      "ساونا واسترخاء.",
      "استيم + ليفة مغربي.",
      "جاكوزي.",
      "جلسة ترميم شعر.",
      "مساج 45 دقيقة مع مدرب متخصص.",
      "سشوار + تثبيت اللوك النهائي.",
      "حمام كريم.",
      "مميزات إضافية: لوكر خاص، شاور، غرفة تغيير خاصة، تعقيم كامل وأدوات شخصية.",
    ].join("\n"),
    detailsEn: [
      "Haircut.",
      "Steam beard treatment.",
      "Hydrofacial skin cleansing (12 stages).",
      "Full body wax.",
      "Hair coloring.",
      "Topik for hair gaps.",
      "Hand and foot pedicure.",
      "Sauna and relaxation.",
      "Steam session + Moroccan bath scrub.",
      "Jacuzzi.",
      "Hair repair session.",
      "45-minute massage with a specialist therapist.",
      "Blow-dry + final look styling.",
      "Cream bath treatment.",
      "Extras: private locker, shower, private changing room, full sterilization and personal tools.",
    ].join("\n"),
    oldPrice: "5500.00",
    newPrice: "2900.00",
    imageUrl: "/images/offer-groom-2900.jpeg",
    badgeAr: "الباقة الملكية",
    validUntil: null,
    isActive: true,
  },
  {
    titleAr: "عرض العريس بـ 1800",
    titleEn: "Groom Package 1800",
    descriptionAr:
      "تجربة متكاملة تخليك في أفضل لوك وأعلى استرخاء قبل أهم يوم في حياتك.",
    descriptionEn:
      "A complete grooming and relaxation experience before the biggest day of your life.",
    detailsAr: [
      "قص شعر.",
      "دقن بخار.",
      "تنظيف بشرة (هيدروفيشال 7 مراحل).",
      "وكس كامل.",
      "صبغة شعر.",
      "توبيك لفراغات الشعر.",
      "باديكير يد.",
      "ساونا واسترخاء.",
      "استيم + ليفة مغربي.",
      "جاكوزي.",
      "مساج 45 دقيقة مع مدرب متخصص.",
      "حمام كريم + جلسة ترميم شعر.",
      "سشوار + تثبيت اللوك النهائي.",
      "مميزات إضافية: لوكر خاص، شاور، غرفة تغيير خاصة، تعقيم كامل وأدوات شخصية.",
    ].join("\n"),
    detailsEn: [
      "Haircut.",
      "Steam beard treatment.",
      "Hydrofacial skin cleansing (7 stages).",
      "Full body wax.",
      "Hair coloring.",
      "Topik for hair gaps.",
      "Hand pedicure.",
      "Sauna and relaxation.",
      "Steam session + Moroccan bath scrub.",
      "Jacuzzi.",
      "45-minute massage with a specialist therapist.",
      "Cream bath + hair repair session.",
      "Blow-dry + final look styling.",
      "Extras: private locker, shower, private changing room, full sterilization and personal tools.",
    ].join("\n"),
    oldPrice: "4500.00",
    newPrice: "1800.00",
    imageUrl: "/images/offer-groom-1800.jpeg",
    badgeAr: "الأكثر طلباً",
    validUntil: null,
    isActive: true,
  },
  {
    titleAr: "عرض العريس بـ 1000",
    titleEn: "Groom Package 1000",
    descriptionAr:
      "تجربة متكاملة تخليك في أفضل لوك وأعلى استرخاء قبل أهم يوم في حياتك.",
    descriptionEn:
      "A complete grooming and relaxation experience before the biggest day of your life.",
    detailsAr: [
      "قص شعر.",
      "دقن بخار.",
      "تنظيف بشرة (سيشنال 7 مراحل).",
      "وكس كامل.",
      "صبغة شعر.",
      "تويك.",
      "باديكير يد.",
      "تسبيتات.",
      "سشوار.",
      "مميزات إضافية: لوكر خاص، شاور، غرفة تغيير خاصة.",
      "أسعار شاملة.",
    ].join("\n"),
    detailsEn: [
      "Haircut.",
      "Steam beard treatment.",
      "Skin cleansing (7 stages).",
      "Full body wax.",
      "Hair coloring.",
      "Topik for hair gaps.",
      "Hand pedicure.",
      "Hair fixing treatment.",
      "Blow-dry.",
      "Extras: private locker, shower, private changing room.",
      "All-inclusive pricing.",
    ].join("\n"),
    oldPrice: "2500.00",
    newPrice: "1000.00",
    imageUrl: "/images/offer-groom-1000.jpeg",
    badgeAr: "أسعار شاملة",
    validUntil: null,
    isActive: true,
  },
  {
    titleAr: "عرض SADDAM بـ 700",
    titleEn: "SADDAM Offer 700",
    descriptionAr: "محتاج تروق على نفسك؟ الحق عرض SADDAM بسعر مخفّض.",
    descriptionEn:
      "Need to treat yourself? Grab the SADDAM offer at a discounted price.",
    detailsAr: [
      "قص شعر.",
      "سشوار.",
      "دقن.",
      "تنظيف بشرة VIP.",
    ].join("\n"),
    detailsEn: [
      "Haircut.",
      "Blow-dry.",
      "Beard grooming.",
      "VIP skin cleansing.",
    ].join("\n"),
    oldPrice: "1150.00",
    newPrice: "700.00",
    imageUrl: "/images/offer-saddam-700.jpeg",
    badgeAr: "عرض سريع",
    validUntil: null,
    isActive: true,
  },
];
