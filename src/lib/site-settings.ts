import { defaultSettings, type SiteSettingsMap } from "@/data/settings-schema";

export type { SiteSettingsMap };

/** قيمة إعداد من قاعدة البيانات، ولو مش موجودة بترجع القيمة الافتراضية */
export function setting(
  settings: SiteSettingsMap | undefined,
  key: string,
  fallback = ""
) {
  const value = settings?.[key];
  if (value !== undefined && value !== null && value !== "") return value;
  return defaultSettings[key] ?? fallback;
}

/** لينك واتساب من إعدادات الموقع */
export function whatsappLinkFromSettings(
  settings: SiteSettingsMap | undefined,
  message?: string
) {
  const number = setting(settings, "whatsapp");
  const text = message ?? setting(settings, "whatsappMessage");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export { defaultSettings };
