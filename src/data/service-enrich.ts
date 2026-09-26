/**
 * تصنيف الخدمات وقت زرع قاعدة البيانات.
 *
 * قبل كده كان ترتيب وتصنيف خدمات كل فرع مكتوب في الكود (hard-coded).
 * دلوقتي الخدمة نفسها بتحمل بياناتها في قاعدة البيانات:
 *   displayNameAr  → الاسم المختصر في الكارت
 *   categoryAr     → القسم
 *   branchSlugs    → الفروع المتاحة فيها (فاضي = كل الفروع)
 *   isFeatured     → تظهر في قائمة خدمات الفرع على الصفحة الرئيسية؟
 *   sortOrder      → الترتيب
 *
 * الملف ده بيملا القيم دي تلقائياً للبيانات الأساسية علشان الموقع يفضل
 * بنفس شكله، وبعد كده أي تعديل بيتم من لوحة التحكم (/admin).
 */
import type { NewService } from "@/db/schema";

type Definition = {
  displayNameAr: string;
  categoryAr: string;
  branchSlugs: string;
  matches: (name: string) => boolean;
};

const core = (
  displayNameAr: string,
  categoryAr: string,
  matches: (name: string) => boolean
): Definition => ({ displayNameAr, categoryAr, branchSlugs: "", matches });

const nasr = (
  displayNameAr: string,
  categoryAr: string,
  matches: (name: string) => boolean
): Definition => ({
  displayNameAr,
  categoryAr,
  branchSlugs: "nasr-city",
  matches,
});

export const serviceDefinitions: Definition[] = [
  core("قص شعر", "حلاقة وعناية", (n) => /^قص شعر/.test(n)),
  core("قص أطفال", "حلاقة وعناية", (n) => /^قص أطفال/.test(n)),
  core("دقن", "حلاقة وعناية", (n) => /^دقن/.test(n)),
  core("شعر + دقن", "حلاقة وعناية", (n) => /شعر \+ دقن/.test(n)),
  core("سشوار", "حلاقة وعناية", (n) => /سشوار/.test(n)),
  core("توبيك", "حلاقة وعناية", (n) => /توبيك/.test(n)),
  core("تنظيف بشرة", "العناية بالبشرة", (n) => /تنظيف بشرة/.test(n)),
  core("ماسك وجه", "العناية بالبشرة", (n) => /ماسك/.test(n)),
  core("وكس", "وكس وإزالة الشعر", (n) => /وكس/.test(n)),
  core("صبغة شعر", "صبغات وتجميل", (n) => /صبغة شعر/.test(n)),
  core("صبغة دقن", "صبغات وتجميل", (n) => /صبغة دقن/.test(n)),
  core("بروتين", "العناية بالشعر", (n) => /بروتين/.test(n)),
  core("كافيار", "العناية بالشعر", (n) => /كافيار/.test(n)),
  core("بونكس", "العناية بالشعر", (n) => /بونكس/.test(n)),
  core("كيراتين", "العناية بالشعر", (n) => /كيراتين/.test(n)),
  core(
    "مانيكير يد",
    "عناية باليدين والقدمين",
    (n) => /^مانيكير يد$/.test(n) || /^باديكير يد$/.test(n)
  ),
  core("باديكير قدم", "عناية باليدين والقدمين", (n) => /^باديكير قدم$/.test(n)),
  nasr("ساونا علاجية", "VIP MEN EXPERIENCE", (n) => /ساونا/.test(n)),
  nasr("استيم + حمام مغربي", "VIP MEN EXPERIENCE", (n) => /استيم/.test(n)),
  nasr("جاكوزي", "VIP MEN EXPERIENCE", (n) => /جاكوزي/.test(n)),
  nasr("مساج", "VIP MEN EXPERIENCE", (n) => /مساج/.test(n)),
  nasr("باديكير علاجي (يد + قدم)", "VIP MEN EXPERIENCE", (n) =>
    /باديكير علاجي/.test(n)
  ),
];

/** تصنيف تقريبي لباقي الخدمات اللي مش في القائمة المختارة */
function guessCategory(name: string) {
  if (/ساونا|جاكوزي|استيم|مساج|حمام مغربي/.test(name)) return "VIP MEN EXPERIENCE";
  if (/بشرة|ماسك|تنظيف/.test(name)) return "العناية بالبشرة";
  if (/وكس/.test(name)) return "وكس وإزالة الشعر";
  if (/صبغة|حنة|ميش/.test(name)) return "صبغات وتجميل";
  if (/بروتين|كافيار|بونكس|كيراتين|زيوت|حمام كريم/.test(name))
    return "العناية بالشعر";
  if (/مانيكير|باديكير|أظافر/.test(name)) return "عناية باليدين والقدمين";
  return "حلاقة وعناية";
}

/**
 * بيضيف الحقول الجديدة لقائمة الخدمات الأساسية.
 * أول خدمة بتطابق كل تعريف بتبقى «مميزة» (بتظهر في قائمة الفرع)،
 * والباقي بيتسجّل عادي في قاعدة البيانات وتقدر تفعّله من لوحة التحكم.
 */
export function enrichServices(rows: NewService[]): NewService[] {
  const used = new Set<number>();
  const enriched: NewService[] = rows.map((row) => ({ ...row }));

  serviceDefinitions.forEach((definition, order) => {
    const index = enriched.findIndex(
      (row, i) => !used.has(i) && definition.matches(row.nameAr)
    );
    if (index === -1) return;
    used.add(index);
    enriched[index] = {
      ...enriched[index],
      displayNameAr: definition.displayNameAr,
      categoryAr: definition.categoryAr,
      branchSlugs: definition.branchSlugs,
      isFeatured: true,
      sortOrder: (order + 1) * 10,
    };
  });

  return enriched.map((row, index) =>
    used.has(index)
      ? row
      : {
          ...row,
          displayNameAr: row.displayNameAr ?? null,
          categoryAr: row.categoryAr ?? guessCategory(row.nameAr),
          branchSlugs: row.branchSlugs ?? "",
          isFeatured: false,
          sortOrder: 1000 + index,
        }
  );
}
