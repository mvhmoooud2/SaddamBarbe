/**
 * بيانات التواصل واللينكات بتاعة الصالون.
 * عدّل من هنا مرة واحدة، والتغيير هيمشي على الموقع كله (الفوتر + الحجز).
 */
export const siteConfig = {
  nameAr: "صالون صدام للحلاقة",
  nameEn: "SADDAM BARBER",

  /** الرقم زي ما بيظهر للزوار */
  phoneDisplay: "+20 123 456 7890",
  /** نفس الرقم بلينك اتصال مباشر */
  phoneHref: "tel:+201234567890",

  /**
   * رقم الواتساب بالصيغة الدولية، من غير + ومن غير مسافات.
   * مثال: 201234567890
   * (لو الرقم اتغير، بيتغيّر هنا مرة واحدة وبس)
   */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "201234567890",

  address: "شارع التحرير، القاهرة، مصر",
  hours: "يومياً من 10:00 صباحاً حتى 10:00 مساءً",

  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
} as const;

/** لينك واتساب مع رسالة جاهزة */
export function whatsappLink(message: string) {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
