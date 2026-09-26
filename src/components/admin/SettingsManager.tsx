"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { settingGroups } from "@/data/settings-schema";
import ImageField from "./ImageField";

export default function SettingsManager({ onSaved }: { onSaved?: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
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
      setNotice("تم حفظ الإعدادات ✅");
      onSaved?.();
      setTimeout(() => setNotice(null), 4000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-[#c9a227]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#f5f0e6]">إعدادات ونصوص الموقع</h2>
          <p className="text-xs text-[#f5f0e6]/50">
            الأرقام والعناوين والنصوص اللي بيشوفها العميل
          </p>
        </div>
        <button
          onClick={() => void save()}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full bg-[#c9a227] px-6 py-2.5 text-sm font-bold text-[#0f0f0f] disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          حفظ كل التغييرات
        </button>
      </div>

      {notice && (
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {settingGroups.map((group) => (
        <section
          key={group.id}
          className="rounded-2xl border border-[#c9a227]/20 bg-[#1a1a1a] p-5"
        >
          <h3 className="mb-4 font-bold text-[#c9a227]">{group.titleAr}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {group.fields.map((field) => (
              <div
                key={field.key}
                className={
                  field.type === "textarea" || field.type === "image"
                    ? "md:col-span-2"
                    : ""
                }
              >
                <label className="mb-1 block text-xs font-semibold text-[#f5f0e6]/70">
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
                    rows={3}
                    value={values[field.key] ?? ""}
                    onChange={(event) =>
                      setValues((previous) => ({
                        ...previous,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[#c9a227]/25 bg-[#0f0f0f] px-3 py-2 text-sm leading-relaxed text-[#f5f0e6] outline-none focus:border-[#c9a227]"
                  />
                ) : (
                  <input
                    value={values[field.key] ?? ""}
                    dir={field.type === "url" || field.type === "phone" ? "ltr" : undefined}
                    onChange={(event) =>
                      setValues((previous) => ({
                        ...previous,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[#c9a227]/25 bg-[#0f0f0f] px-3 py-2 text-sm text-[#f5f0e6] outline-none focus:border-[#c9a227]"
                  />
                )}
                {field.hintAr && (
                  <p className="mt-1 text-[11px] text-[#f5f0e6]/40">{field.hintAr}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
