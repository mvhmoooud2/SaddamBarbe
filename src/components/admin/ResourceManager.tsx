"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { AdminField, AdminResource } from "@/data/admin-fields";
import ImageField from "./ImageField";

type Row = Record<string, unknown>;

type Props = {
  resource: AdminResource;
  branchOptions: { slug: string; name: string }[];
  onChanged?: () => void;
};

/** بيحوّل قيمة الصف لقيمة صالحة للفورم */
function toFormValue(field: AdminField, value: unknown): string | boolean {
  if (field.type === "boolean") return value === true;
  if (value === null || value === undefined) return "";
  if (field.type === "datetime") {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }
  return String(value);
}

function emptyForm(resource: AdminResource) {
  const form: Record<string, string | boolean> = {};
  for (const field of resource.fields) {
    form[field.name] = field.type === "boolean" ? true : "";
  }
  return form;
}

function cellText(field: AdminField | undefined, value: unknown) {
  if (field?.type === "boolean") return value ? "نعم" : "لا";
  if (value === null || value === undefined || value === "") return "—";
  if (field?.type === "datetime") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" });
  }
  const text = String(value);
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

export default function ResourceManager({
  resource,
  branchOptions,
  onChanged,
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [isSaving, setSaving] = useState(false);

  const fieldsByName = useMemo(
    () => new Map(resource.fields.map((field) => [field.name, field])),
    [resource]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${resource.key}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل التحميل");
      setRows(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "فشل التحميل");
    } finally {
      setLoading(false);
    }
  }, [resource.key]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    setEditingId(null);
  }, [load]);

  function startCreate() {
    setForm(emptyForm(resource));
    setEditingId("new");
  }

  function startEdit(row: Row) {
    const next: Record<string, string | boolean> = {};
    for (const field of resource.fields) {
      next[field.name] = toFormValue(field, row[field.name]);
    }
    setForm(next);
    setEditingId(Number(row.id));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const isNew = editingId === "new";
      const response = await fetch(
        isNew
          ? `/api/admin/${resource.key}`
          : `/api/admin/${resource.key}/${editingId}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل الحفظ");
      setEditingId(null);
      setNotice("تم الحفظ ✅ التغيير ظاهر على الموقع دلوقتي");
      await load();
      onChanged?.();
      setTimeout(() => setNotice(null), 4000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: Row) {
    await fetch(`/api/admin/${resource.key}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    await load();
    onChanged?.();
  }

  async function remove(row: Row) {
    if (!confirm(`متأكد إنك عايز تحذف «${row.nameAr ?? row.titleAr ?? row.customerName ?? row.alt ?? row.id}»؟`)) {
      return;
    }
    const response = await fetch(`/api/admin/${resource.key}/${row.id}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "فشل الحذف");
      return;
    }
    await load();
    onChanged?.();
  }

  function renderInput(field: AdminField) {
    const value = form[field.name];

    if (field.type === "boolean") {
      return (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#f5f0e6]">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) =>
              setForm({ ...form, [field.name]: event.target.checked })
            }
            className="h-4 w-4 accent-[#c9a227]"
          />
          {field.labelAr}
        </label>
      );
    }

    if (field.type === "image") {
      return (
        <ImageField
          value={String(value ?? "")}
          onChange={(next) => setForm({ ...form, [field.name]: next })}
        />
      );
    }

    if (field.type === "branches") {
      const selected = String(value ?? "")
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean);
      return (
        <div className="flex flex-wrap gap-3">
          {branchOptions.length === 0 && (
            <span className="text-xs text-[#f5f0e6]/50">مفيش فروع متسجلة</span>
          )}
          {branchOptions.map((branch) => (
            <label
              key={branch.slug}
              className="flex cursor-pointer items-center gap-2 text-sm text-[#f5f0e6]"
            >
              <input
                type="checkbox"
                checked={selected.includes(branch.slug)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...selected, branch.slug]
                    : selected.filter((slug) => slug !== branch.slug);
                  setForm({ ...form, [field.name]: next.join(",") });
                }}
                className="h-4 w-4 accent-[#c9a227]"
              />
              {branch.name}
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={String(value ?? "")}
          onChange={(event) =>
            setForm({ ...form, [field.name]: event.target.value })
          }
          className="w-full rounded-lg border border-[#c9a227]/25 bg-[#0f0f0f] px-3 py-2 text-sm text-[#f5f0e6] outline-none focus:border-[#c9a227]"
        >
          <option value="">— اختار —</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.labelAr}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          value={String(value ?? "")}
          rows={3}
          onChange={(event) =>
            setForm({ ...form, [field.name]: event.target.value })
          }
          className="w-full rounded-lg border border-[#c9a227]/25 bg-[#0f0f0f] px-3 py-2 text-sm leading-relaxed text-[#f5f0e6] outline-none focus:border-[#c9a227]"
        />
      );
    }

    return (
      <input
        type={
          field.type === "number" || field.type === "price"
            ? "number"
            : field.type === "datetime"
              ? "datetime-local"
              : "text"
        }
        step={field.type === "price" ? "0.01" : field.type === "number" ? "any" : undefined}
        value={String(value ?? "")}
        onChange={(event) =>
          setForm({ ...form, [field.name]: event.target.value })
        }
        className="w-full rounded-lg border border-[#c9a227]/25 bg-[#0f0f0f] px-3 py-2 text-sm text-[#f5f0e6] outline-none focus:border-[#c9a227]"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#f5f0e6]">{resource.titleAr}</h2>
          <p className="text-xs text-[#f5f0e6]/50">
            {rows.length} عنصر — أي تعديل بيظهر على الموقع فوراً
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-full border border-[#c9a227]/40 px-4 py-2 text-xs font-bold text-[#c9a227]"
          >
            <RefreshCcw className="h-4 w-4" />
            تحديث
          </button>
          {resource.canCreate !== false && (
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a227] px-4 py-2 text-xs font-bold text-[#0f0f0f]"
            >
              <Plus className="h-4 w-4" />
              إضافة {resource.singularAr}
            </button>
          )}
        </div>
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

      {editingId !== null && (
        <div className="rounded-2xl border border-[#c9a227]/30 bg-[#1a1a1a] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-[#c9a227]">
              {editingId === "new"
                ? `إضافة ${resource.singularAr}`
                : `تعديل ${resource.singularAr}`}
            </h3>
            <button
              onClick={() => setEditingId(null)}
              className="text-[#f5f0e6]/60 hover:text-[#f5f0e6]"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {resource.fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "textarea" ||
                  field.type === "image" ||
                  field.type === "branches"
                    ? "md:col-span-2"
                    : ""
                }
              >
                {field.type !== "boolean" && (
                  <label className="mb-1 block text-xs font-semibold text-[#f5f0e6]/70">
                    {field.labelAr}
                    {field.required && <span className="text-red-400"> *</span>}
                  </label>
                )}
                {renderInput(field)}
                {field.hintAr && (
                  <p className="mt-1 text-[11px] text-[#f5f0e6]/40">{field.hintAr}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
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
              حفظ
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="rounded-full border border-[#f5f0e6]/20 px-6 py-2.5 text-sm text-[#f5f0e6]/70"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#c9a227]/20">
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead className="bg-[#1a1a1a] text-xs uppercase text-[#c9a227]">
            <tr>
              {resource.listFields.map((name) => (
                <th key={name} className="px-4 py-3 font-bold">
                  {fieldsByName.get(name)?.labelAr ?? name}
                </th>
              ))}
              <th className="px-4 py-3">تحكم</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={resource.listFields.length + 1}
                  className="px-4 py-8 text-center text-[#f5f0e6]/50"
                >
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={resource.listFields.length + 1}
                  className="px-4 py-8 text-center text-[#f5f0e6]/50"
                >
                  مفيش بيانات لسه
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={String(row.id)}
                className="border-t border-[#c9a227]/10 text-[#f5f0e6]/85 hover:bg-[#1a1a1a]/60"
              >
                {resource.listFields.map((name) => (
                  <td key={name} className="px-4 py-3 align-top">
                    {name === "src" || name === "imageUrl" ? (
                      row[name] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={String(row[name])}
                          alt=""
                          className="h-10 w-16 rounded object-cover"
                        />
                      ) : (
                        "—"
                      )
                    ) : (
                      cellText(fieldsByName.get(name), row[name])
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(row)}
                      className="rounded-lg border border-[#c9a227]/40 p-2 text-[#c9a227]"
                      aria-label="تعديل"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {"isActive" in row && (
                      <button
                        onClick={() => void toggleActive(row)}
                        className="rounded-lg border border-[#f5f0e6]/20 px-3 py-2 text-xs text-[#f5f0e6]/70"
                      >
                        {row.isActive ? "إخفاء" : "إظهار"}
                      </button>
                    )}
                    <button
                      onClick={() => void remove(row)}
                      className="rounded-lg border border-red-500/40 p-2 text-red-400"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
