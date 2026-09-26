/**
 * بيانات فروع الصالون — مصدر واحد للحقيقة.
 *
 * أي تعديل على عنوان أو رقم أو ميعاد بيتعمل هنا مرة واحدة بس،
 * وبيظهر تلقائياً في قسم «فروعنا» وفي الفوتر وفي نموذج الحجز.
 *
 * البيانات دي مأخوذة من صفحتي الفرعين على خرائط جوجل (سبتمبر 2026):
 *   • فرع حدائق القبة: https://maps.app.goo.gl/FvLTtjg1pLMVt4T2A
 *   • فرع مدينة نصر:   https://maps.app.goo.gl/qFjCxjWv9eCKxH9X7
 * والإحداثيات (lat/lng) مستخرجة من نفس الصفحتين ومتأكد منها بمطابقتها
 * مع الـ Plus Code بتاع كل فرع (37HH+J6 و 387P+8M).
 *
 * التقييمات (googleRating / googleReviews) متراجعة من نفس الصفحتين
 * (آخر مراجعة: 26 سبتمبر 2026):
 *   • حدائق القبة: 4.3 من 21 تقييم
 *   • مدينة نصر:   5.0
 * لو التقييم اتغيّر على جوجل، حدّث الأرقام هنا بس وهتظهر في قسم «فروعنا».
 */

export type Branch = {
  /** معرف ثابت للفرع (بالإنجليزي، من غير مسافات) */
  id: string;
  /** اسم الفرع زي ما بيظهر للزائر */
  nameAr: string;
  /** اسم المكان على خرائط جوجل (اختياري) */
  listingNameAr?: string;
  /** شارة اختيارية جنب الاسم */
  badgeAr?: string;
  /** العنوان الكامل بالعربي */
  addressAr: string;
  /** علامة مميزة / Plus Code يساعد الزائر يلاقي الفرع (اختياري) */
  landmarkAr?: string;
  /** سطر تعريفي صغير جوه كارت الفرع (اختياري) */
  summaryAr?: string;
  /** رقم التليفون زي ما بيظهر للزائر */
  phoneDisplay: string;
  /** نفس الرقم بلينك اتصال مباشر */
  phoneHref: string;
  /** رقم واتساب الفرع بالصيغة الدولية من غير + ولا مسافات */
  whatsapp: string;
  /** مواعيد العمل */
  hoursAr: string;
  /** إحداثيات الفرع — مركز الخريطة ولينك الاتجاهات */
  lat: number;
  lng: number;
  /**
   * صورة قائمة أسعار الفرع (اختياري) — مسار من جذر public
   * مثال: "/images/prices-nasr-city.jpg"
   * بتتعرض جوه كارت الفرع في قسم «فروعنا» في بلوك «قائمة الأسعار».
   */
  priceListImage?: string;
  /** تقييم الفرع على خرائط جوجل (اختياري) */
  googleRating?: number;
  /** عدد التقييمات على خرائط جوجل (اختياري) */
  googleReviews?: number;
  /** لينك الفرع على خرائط جوجل */
  mapsUrl?: string;
};

export const branches: Branch[] = [
  {
    id: "hadayek-qobbah",
    nameAr: "فرع حدائق القبة",
    listingNameAr: "صدام باربرشوب",
    badgeAr: "الفرع الرئيسي",
    addressAr: "87 شارع مصر والسودان، حدائق القبة، القاهرة",
    landmarkAr: "Plus Code: 37HH+J6 حدائق القبة",
    summaryAr:
      "حلاقة وعناية: قص وشعر ودقن وبشرة وشعر وأظافر — بدون ساونا أو جاكوزي.",
    phoneDisplay: "010 6140 2242",
    phoneHref: "tel:+201061402242",
    whatsapp: "201061402242",
    hoursAr: "يومياً من 11:00 صباحاً حتى 2:00 صباحاً",
    lat: 30.0790509,
    lng: 31.2780675,
    googleRating: 4.3,
    googleReviews: 21,
    mapsUrl: "https://maps.app.goo.gl/FvLTtjg1pLMVt4T2A",
  },
  {
    id: "nasr-city",
    nameAr: "فرع مدينة نصر – عباس العقاد",
    listingNameAr: "MS صدام — صالون صدام",
    addressAr: "شارع عباس العقاد، مدينة نصر، القاهرة",
    landmarkAr: "Plus Code: 387P+8M مدينة نصر",
    summaryAr:
      "VIP MEN EXPERIENCE: الخدمات الأساسية + ساونا علاجية واستيم وحمام مغربي وجاكوزي ومساج.",
    phoneDisplay: "011 2153 7537",
    phoneHref: "tel:+201121537537",
    whatsapp: "201121537537",
    hoursAr: "يومياً من 11:00 صباحاً حتى 2:30 صباحاً",
    priceListImage: "/images/prices-nasr-city.jpg",
    lat: 30.0633343,
    lng: 31.3366492,
    googleRating: 5,
    googleReviews: 8,
    mapsUrl: "https://maps.app.goo.gl/qFjCxjWv9eCKxH9X7",
  },
];

/**
 * الفرع الأساسي للموقع: رقمه وعنوانه ومواعيده بتظهر في الفوتر،
 * وهو الاختيار الافتراضي في نموذج الحجز.
 * (الترتيب هنا هو اللي بيحدد — غيّر ترتيب المصفوفة لو الفرع الأساسي اتغير)
 */
export const primaryBranch = branches[0];

/**
 * نص البحث اللي الخريطة بتدور عليه:
 * الإحداثيات أولاً (أدق — بتثبت الدبوس على مكان الفرع بالظبط)،
 * وبعدين اسم المكان + العنوان.
 */
function mapTarget(branch: Branch) {
  if (typeof branch.lat === "number" && typeof branch.lng === "number") {
    return `${branch.lat},${branch.lng}`;
  }
  return `${branch.listingNameAr ?? branch.nameAr} ${branch.addressAr}`;
}

/**
 * لينك خريطة جوجل المدمجة (iframe) — من غير أي API key.
 * hl=ar علشان واجهة الخريطة تبقى عربي.
 */
export function mapEmbedUrl(branch: Branch) {
  const query = encodeURIComponent(mapTarget(branch));
  return `https://www.google.com/maps?q=${query}&z=16&hl=ar&output=embed`;
}

/** لينك «الاتجاهات» في تطبيق/موقع خرائط جوجل */
export function directionsUrl(branch: Branch) {
  const destination = encodeURIComponent(mapTarget(branch));
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** لينك واتساب الفرع برسالة جاهزة فيها اسم الفرع */
export function branchWhatsappLink(branch: Branch, salonName: string) {
  const message = `السلام عليكم، عايز أحجز موعد في ${salonName} — ${branch.nameAr}`;
  return `https://wa.me/${branch.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** لينك واتساب فرع معيّن برسالة من اختيارك (بيستخدمه نموذج الحجز) */
export function branchWhatsappLinkWithMessage(
  branch: Branch,
  message: string
) {
  return `https://wa.me/${branch.whatsapp}?text=${encodeURIComponent(message)}`;
}
