import type { Service } from "@/db/schema";

export type BranchServiceOption = Service & {
  displayNameAr: string;
  categoryAr: string;
};

type ServiceDefinition = {
  displayNameAr: string;
  categoryAr: string;
  matches: (name: string) => boolean;
};

const matchesAny = (...patterns: RegExp[]) => (name: string) =>
  patterns.some((pattern) => pattern.test(name));

/**
 * الخدمات الأساسية الموجودة في فرع حدائق القبة، بالترتيب الذي يظهر للعميل.
 * بنطابق على اسم الخدمة حتى تشتغل القائمة سواء الداتا جاية من قاعدة البيانات
 * أو من البيانات الاحتياطية.
 */
const coreServices: ServiceDefinition[] = [
  {
    displayNameAr: "قص شعر",
    categoryAr: "حلاقة وعناية",
    matches: (name) => /^قص شعر/.test(name),
  },
  {
    displayNameAr: "قص أطفال",
    categoryAr: "حلاقة وعناية",
    matches: (name) => /^قص أطفال/.test(name),
  },
  {
    displayNameAr: "دقن",
    categoryAr: "حلاقة وعناية",
    matches: (name) => /^دقن/.test(name),
  },
  {
    displayNameAr: "شعر + دقن",
    categoryAr: "حلاقة وعناية",
    matches: (name) => /شعر\s*\+\s*دقن/.test(name),
  },
  {
    displayNameAr: "سشوار",
    categoryAr: "حلاقة وعناية",
    matches: matchesAny(/سشوار/, /شوار/),
  },
  {
    displayNameAr: "Skin Care",
    categoryAr: "عناية بالبشرة",
    matches: (name) => /بشرة/.test(name) && !/هيدرو/.test(name),
  },
  {
    displayNameAr: "Hydrafacial",
    categoryAr: "عناية بالبشرة",
    matches: matchesAny(/هيدرو/, /hydro/i),
  },
  {
    displayNameAr: "واكس",
    categoryAr: "عناية بالبشرة",
    matches: matchesAny(/واكس/, /وكس/),
  },
  {
    displayNameAr: "صبغة",
    categoryAr: "صبغات وتجميل",
    matches: (name) => /^صبغة/.test(name),
  },
  {
    displayNameAr: "توبيك",
    categoryAr: "صبغات وتجميل",
    matches: matchesAny(/توبيك/, /تويك/),
  },
  {
    displayNameAr: "حمام زيت",
    categoryAr: "العناية بالشعر",
    matches: (name) => /^حمام زيت$/.test(name),
  },
  {
    displayNameAr: "حمام زيت أمبول",
    categoryAr: "العناية بالشعر",
    matches: (name) => /حمام زيت.*أمبول/.test(name),
  },
  {
    displayNameAr: "ترميم شعر",
    categoryAr: "العناية بالشعر",
    matches: (name) => /ترميم/.test(name),
  },
  {
    displayNameAr: "فرد أمريكي",
    categoryAr: "العناية بالشعر",
    matches: (name) => /فرد أمريكي/.test(name),
  },
  {
    displayNameAr: "بروتين",
    categoryAr: "العناية بالشعر",
    matches: (name) => /بروتين/.test(name),
  },
  {
    displayNameAr: "كافيار",
    categoryAr: "العناية بالشعر",
    matches: (name) => /كافيار/.test(name),
  },
  {
    displayNameAr: "بونكس",
    categoryAr: "العناية بالشعر",
    matches: (name) => /بونكس/.test(name),
  },
  {
    displayNameAr: "كيراتين",
    categoryAr: "العناية بالشعر",
    matches: (name) => /كيراتين/.test(name),
  },
  {
    displayNameAr: "مانيكير يد",
    categoryAr: "عناية باليدين والقدمين",
    matches: (name) => /^مانيكير يد$/.test(name) || /^باديكير يد$/.test(name),
  },
  {
    displayNameAr: "باديكير قدم",
    categoryAr: "عناية باليدين والقدمين",
    matches: (name) => /^باديكير قدم$/.test(name),
  },
];

const NasrCityExtras: ServiceDefinition[] = [
  {
    displayNameAr: "ساونا علاجية",
    categoryAr: "VIP MEN EXPERIENCE",
    matches: (name) => /ساونا/.test(name),
  },
  {
    displayNameAr: "استيم + حمام مغربي",
    categoryAr: "VIP MEN EXPERIENCE",
    matches: (name) => /استيم/.test(name),
  },
  {
    displayNameAr: "جاكوزي",
    categoryAr: "VIP MEN EXPERIENCE",
    matches: (name) => /جاكوزي/.test(name),
  },
  {
    displayNameAr: "مساج",
    categoryAr: "VIP MEN EXPERIENCE",
    matches: (name) => /مساج/.test(name),
  },
  {
    displayNameAr: "باديكير علاجي (يد + قدم)",
    categoryAr: "VIP MEN EXPERIENCE",
    matches: (name) => /باديكير علاجي/.test(name),
  },
];

const definitionsByBranch: Record<string, ServiceDefinition[]> = {
  "hadayek-qobbah": coreServices,
  "nasr-city": [...coreServices, ...NasrCityExtras],
};

/**
 * يرجّع نسخة مرتبة ومفلترة من الخدمات الخاصة بالفرع المختار.
 * كل خدمة تظهر مرة واحدة فقط حتى لو كان في الداتا أكثر من اختيار لنفس النوع.
 */
export function getBranchServiceOptions(
  branchId: string,
  services: Service[],
): BranchServiceOption[] {
  const definitions = definitionsByBranch[branchId] ?? coreServices;
  const usedIds = new Set<number>();

  return definitions.flatMap((definition) => {
    const service = services.find(
      (item) => !usedIds.has(item.id) && definition.matches(item.nameAr),
    );

    if (!service) return [];
    usedIds.add(service.id);
    return [{ ...service, ...definition }];
  });
}

export function branchHasExtraSpa(branchId: string) {
  return branchId === "nasr-city";
}
