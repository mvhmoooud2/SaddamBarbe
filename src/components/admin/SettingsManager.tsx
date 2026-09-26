"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Globe,
  Layers,
  Layout,
  Loader2,
  PhoneCall,
  Save,
  Settings2,
  Sparkles,
} from "lucide-react";
import { settingGroups } from "@/data/settings-schema";
import ImageField from "./ImageField";

const sectionIcons: Record<string, any> = {
  general: Globe,
  contact: PhoneCall,
  hero: Sparkles,
  sections: Layers,
};

export default function SettingsManager({ onSaved }: { onSaved?: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeGroupId, setActiveGroupId] = useState("general");
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "فشل التحميل");
        setValues(data);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل الحفظ");
      setValues(data);
      setNotice("تم حفظ إعدادات الموقع بنجاح في قاعدة البيانات ✅");
      onSaved?.();
      setTimeout(() => setNotice(null), 4000);
    } catch (saveError: any) {
      setError(saveError?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-[#c9a227]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentGroup =
    settingGroups.find((g) => g.id === activeGroupId) || settingGroups[0];

  return (
    <div className="space-y-6">
      {/* الهيدر وزر الحفظ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-[#f5f0e6]">
            <Settings2 className="h-5 w-5 text-[#c9a227]" />
            إعدادات ونصوص الموقع
          </h2>
          <p className="text-xs text-[#f5f0e6]/50">
            عدّل اسم الصالون، الشعار، أرقام التواصل، السوشيال، ونصوص الواجهة
            بسهولة
          </p>
        </div>
        <button
          onClick={() => void save()}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full bg-[#c9a227] px-6 py-2.5 text-xs font-bold text-[#0f0f0f] shadow-lg hover:bg-[#e6be3f] disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              حفظ جميع الإعدادات
            </>
          )}
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* تبويبات مجموعات الإعدادات */}
      <div className="flex gap-2 overflow-x-auto border-b border-[#c9a227]/20 pb-2">
        {settingGroups.map((group) => {
          const Icon = sectionIcons[group.id] || Layers;
          const isActive = group.id === activeGroupId;

          return (
            <button
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                isActive
                  ? "bg-[#c9a227] text-[#0f0f0f] shadow-md shadow-[#c9a227]/20"
                  : "border border-[#c9a227]/20 bg-[#141414] text-[#f5f0e6]/70 hover:border-[#c9a227]/50 hover:text-[#c9a227]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {group.titleAr}
            </button>
          );
        })}
      </div>

      {/* نموذج الإعدادات للمجموعة النشطة */}
      <section className="rounded-3xl border border-[#c9a227]/25 bg-[#141414] p-6 shadow-xl">
        <h3 className="mb-5 text-base font-bold text-[#c9a227]">
          {currentGroup.titleAr}
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          {currentGroup.fields.map((field) => (
            <div
              key={field.key}
              className={
                field.type === "textarea" || field.type === "image"
                  ? "md:col-span-2"
                  : ""
              }
            >
              <label className="mb-1.5 block text-xs font-bold text-[#f5f0e6]/80">
                {field.labelAr}
              </label>

              {field.type === "image" ? (
                <ImageField
                  value={values[field.key] ?? ""}
                  onChange={(next) =>
                    setValues((previous) => ({ ...previous, [field.key]: next }))
                  }
                />
              ) : field.type === "textarea" ? (
                <textarea
                  rows={field.key === "footerAbout" ? 4 : 3}
                  value={values[field.key] ?? ""}
                  placeholder={field.hintAr || `أدخل ${field.labelAr}`}
                  onChange={(event) =>
                    setValues((previous) => ({
                      ...previous,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-3.5 py-2.5 text-xs leading-relaxed text-[#f5f0e6] placeholder-[#f5f0e6]/25 outline-none transition focus:border-[#c9a227]"
                />
              ) : (
                <input
                  value={values[field.key] ?? ""}
                  dir={
                    field.type === "url" || field.type === "phone"
                      ? "ltr"
                      : undefined
                  }
                  placeholder={field.hintAr || `أدخل ${field.labelAr}`}
                  onChange={(event) =>
                    setValues((previous) => ({
                      ...previous,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-[#f5f0e6] placeholder-[#f5f0e6]/25 outline-none transition focus:border-[#c9a227]"
                />
              )}

              {field.hintAr && field.type !== "image" && (
                <p className="mt-1 text-[11px] text-[#f5f0e6]/40">{field.hintAr}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end border-t border-[#c9a227]/20 pt-4">
          <button
            onClick={() => void save()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#c9a227] px-6 py-2.5 text-xs font-bold text-[#0f0f0f] shadow-lg hover:bg-[#e6be3f] disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            حفظ إعدادات هذا القسم
          </button>
        </div>
      </section>
    </div>
  );
}
