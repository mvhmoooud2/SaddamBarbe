"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Star,
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
    form[field.name] =
      field.type === "boolean"
        ? field.name === "isActive" || field.name === "isFeatured"
        : field.name === "sortOrder"
        ? "0"
        : "";
  }
  return form;
}

function cellText(field: AdminField | undefined, value: unknown) {
  if (field?.type === "boolean") return value ? "✅ نعم" : "❌ لا";
  if (value === null || value === undefined || value === "") return "—";
  if (field?.type === "datetime") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" });
  }
  const text = String(value);
  return text.length > 50 ? `${text.slice(0, 50)}…` : text;
}

export default function ResourceManager({
  resource,
  branchOptions,
  onChanged,
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [deleteConfirmRow, setDeleteConfirmRow] = useState<Row | null>(null);
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
    } catch (loadError: any) {
      setError(loadError?.message || "فشل التحميل");
    } finally {
      setLoading(false);
    }
  }, [resource.key]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    setEditingId(null);
    setSearchQuery("");
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
      setNotice(
        isNew
          ? `تمت إضافة ال${resource.singularAr} بنجاح ✅`
          : `تم تحديث ال${resource.singularAr} بنجاح ✅`
      );
      await load();
      onChanged?.();
      setTimeout(() => setNotice(null), 4000);
    } catch (saveError: any) {
      setError(saveError?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: Row) {
    try {
      const response = await fetch(`/api/admin/${resource.key}/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !row.isActive }),
      });
      if (response.ok) {
        setNotice(
          !row.isActive
            ? `تم إظهار «${row.nameAr || row.titleAr || row.id}» على الموقع ✅`
            : `تم إخفاء «${row.nameAr || row.titleAr || row.id}» من الموقع 👁️`
        );
        await load();
        onChanged?.();
        setTimeout(() => setNotice(null), 3000);
      }
    } catch {
      // ignore
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmRow) return;
    const row = deleteConfirmRow;
    setDeleteConfirmRow(null);

    const response = await fetch(`/api/admin/${resource.key}/${row.id}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "فشل الحذف");
      return;
    }
    setNotice(`تم حذف «${row.nameAr || row.titleAr || row.customerName || row.id}» بنجاح 🗑️`);
    await load();
    onChanged?.();
    setTimeout(() => setNotice(null), 3000);
  }

  // تصفية وبحث الصفوف
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // فلتر النشاط
      if (activeFilter === "active" && row.isActive === false) return false;
      if (activeFilter === "inactive" && row.isActive === true) return false;

      // فلتر البحث النصي
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const searchFields = [
        row.nameAr,
        row.nameEn,
        row.titleAr,
        row.customerName,
        row.customerPhone,
        row.categoryAr,
        row.descriptionAr,
        row.alt,
      ];
      return searchFields.some(
        (val) => typeof val === "string" && val.toLowerCase().includes(q)
      );
    });
  }, [rows, searchQuery, activeFilter]);

  function renderInput(field: AdminField) {
    const value = form[field.name];

    if (field.type === "boolean") {
      return (
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#c9a227]/20 bg-[#0a0a0a] p-3 text-sm font-medium text-[#f5f0e6] transition hover:border-[#c9a227]">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) =>
              setForm({ ...form, [field.name]: event.target.checked })
            }
            className="h-4 w-4 accent-[#c9a227]"
          />
          <span>{field.labelAr}</span>
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
        <div className="rounded-xl border border-[#c9a227]/20 bg-[#0a0a0a] p-3">
          <p className="mb-2 text-xs text-[#f5f0e6]/60">
            حدد الفروع التي تتوفر فيها هذه الخدمة (اتركه فارغاً لجميع الفروع):
          </p>
          <div className="flex flex-wrap gap-3">
            {branchOptions.length === 0 && (
              <span className="text-xs text-[#f5f0e6]/40">متاحة في جميع الفروع</span>
            )}
            {branchOptions.map((branch) => (
              <label
                key={branch.slug}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#c9a227]/15 bg-[#141414] px-3 py-1.5 text-xs text-[#f5f0e6] hover:border-[#c9a227]"
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
                  className="h-3.5 w-3.5 accent-[#c9a227]"
                />
                {branch.name}
              </label>
            ))}
          </div>
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
          className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-3.5 py-2.5 text-sm text-[#f5f0e6] outline-none transition focus:border-[#c9a227]"
        >
          <option value="">— اختر من القائمة —</option>
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
          rows={field.name === "detailsAr" || field.name === "detailsEn" ? 6 : 3}
          onChange={(event) =>
            setForm({ ...form, [field.name]: event.target.value })
          }
          placeholder={field.hintAr || `أدخل ${field.labelAr}`}
          className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-3.5 py-2.5 text-sm leading-relaxed text-[#f5f0e6] placeholder-[#f5f0e6]/25 outline-none transition focus:border-[#c9a227]"
        />
      );
    }

    return (
      <div className="relative">
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
          placeholder={field.hintAr || `أدخل ${field.labelAr}`}
          className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-3.5 py-2.5 text-sm text-[#f5f0e6] placeholder-[#f5f0e6]/25 outline-none transition focus:border-[#c9a227]"
        />
        {field.type === "price" && (
          <span className="absolute left-3 top-2.5 text-xs font-bold text-[#c9a227]">
            ج.م
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* هيدر القسم وأزرار التحكم */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#f5f0e6]">{resource.titleAr}</h2>
          <p className="text-xs text-[#f5f0e6]/50">
            إجمالي {rows.length} عنصر — التعديلات تظهر فوراً على الموقع
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/40 px-4 py-2 text-xs font-bold text-[#c9a227] hover:bg-[#c9a227]/10"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            تحديث
          </button>
          {resource.canCreate !== false && (
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#c9a227] px-5 py-2 text-xs font-bold text-[#0f0f0f] shadow-lg hover:bg-[#e6be3f]"
            >
              <Plus className="h-4 w-4" />
              إضافة {resource.singularAr} جديد
            </button>
          )}
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#c9a227]/20 bg-[#141414] p-3.5 shadow">
        <div className="relative min-w-[200px] flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`بحث في ${resource.titleAr}...`}
            className="w-full rounded-xl border border-[#c9a227]/20 bg-[#0a0a0a] px-3.5 py-2 pr-9 text-xs text-[#f5f0e6] placeholder-[#f5f0e6]/30 outline-none focus:border-[#c9a227]"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-[#f5f0e6]/40" />
        </div>

        {resource.fields.some((f) => f.name === "isActive") && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeFilter === "all"
                  ? "bg-[#c9a227] text-[#0f0f0f]"
                  : "bg-[#0a0a0a] text-[#f5f0e6]/60 hover:text-[#f5f0e6]"
              }`}
            >
              الكل ({rows.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("active")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeFilter === "active"
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-[#0a0a0a] text-[#f5f0e6]/60 hover:text-[#f5f0e6]"
              }`}
            >
              المفعّل
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("inactive")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeFilter === "inactive"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-[#0a0a0a] text-[#f5f0e6]/60 hover:text-[#f5f0e6]"
              }`}
            >
              المخفي
            </button>
          </div>
        )}
      </div>

      {/* التنبيهات */}
      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* نموذج الإضافة / التعديل (Modal / Card) */}
      {editingId !== null && (
        <div className="rounded-3xl border border-[#c9a227]/40 bg-[#141414] p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between border-b border-[#c9a227]/20 pb-4">
            <h3 className="text-base font-black text-[#c9a227]">
              {editingId === "new"
                ? `إضافة ${resource.singularAr} جديد`
                : `تعديل بيانات: ${form.nameAr || form.titleAr || form.customerName || resource.singularAr}`}
            </h3>
            <button
              onClick={() => setEditingId(null)}
              className="rounded-full p-1.5 text-[#f5f0e6]/60 hover:bg-[#c9a227]/10 hover:text-[#f5f0e6]"
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
                  field.type === "branches" ||
                  field.name === "detailsAr" ||
                  field.name === "detailsEn"
                    ? "md:col-span-2"
                    : ""
                }
              >
                {field.type !== "boolean" && (
                  <label className="mb-1.5 block text-xs font-bold text-[#f5f0e6]/80">
                    {field.labelAr}
                    {field.required && <span className="text-red-400"> *</span>}
                  </label>
                )}
                {renderInput(field)}
                {field.hintAr && field.type !== "branches" && (
                  <p className="mt-1 text-[11px] text-[#f5f0e6]/40">{field.hintAr}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-[#c9a227]/20 pt-4">
            <button
              onClick={() => void save()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c9a227] px-6 py-2.5 text-sm font-bold text-[#0f0f0f] shadow-lg hover:bg-[#e6be3f] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="rounded-xl border border-[#f5f0e6]/20 bg-[#1a1a1a] px-6 py-2.5 text-sm font-semibold text-[#f5f0e6]/70 hover:text-[#f5f0e6]"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* جدول عرض البيانات */}
      <div className="overflow-hidden rounded-2xl border border-[#c9a227]/20 bg-[#141414] shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-right text-xs">
            <thead className="border-b border-[#c9a227]/20 bg-[#181818] text-[#c9a227]">
              <tr>
                {resource.listFields.map((name) => (
                  <th key={name} className="px-4 py-3.5 font-bold">
                    {fieldsByName.get(name)?.labelAr ?? name}
                  </th>
                ))}
                <th className="px-4 py-3.5 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c9a227]/10">
              {isLoading && (
                <tr>
                  <td
                    colSpan={resource.listFields.length + 1}
                    className="px-4 py-12 text-center text-[#f5f0e6]/50"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#c9a227]" />
                    <p className="mt-2 text-xs">جاري جلب البيانات من قاعدة البيانات...</p>
                  </td>
                </tr>
              )}

              {!isLoading && filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={resource.listFields.length + 1}
                    className="px-4 py-12 text-center text-[#f5f0e6]/50"
                  >
                    {searchQuery ? "لا توجد نتائج مطابقة لبحثك" : "لا توجد بيانات مسجلة بعد"}
                  </td>
                </tr>
              )}

              {filteredRows.map((row) => (
                <tr
                  key={String(row.id)}
                  className={`transition hover:bg-[#1c1c1c] ${
                    row.isActive === false ? "opacity-60 bg-red-950/10" : ""
                  }`}
                >
                  {resource.listFields.map((name) => (
                    <td key={name} className="px-4 py-3 align-middle">
                      {name === "src" || name === "imageUrl" || name === "priceListImage" ? (
                        row[name] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={String(row[name])}
                            alt=""
                            className="h-10 w-14 rounded-lg border border-[#c9a227]/30 object-cover"
                          />
                        ) : (
                          "—"
                        )
                      ) : name === "rating" ? (
                        <div className="flex items-center gap-0.5 text-[#c9a227]">
                          {Array.from({ length: Number(row[name]) || 5 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-[#c9a227]" />
                          ))}
                        </div>
                      ) : name === "price" || name === "newPrice" ? (
                        <span className="font-bold text-[#c9a227]">
                          {Number(row[name]).toFixed(0)} ج.م
                        </span>
                      ) : name === "badgeAr" && row[name] ? (
                        <span className="inline-block rounded-full bg-[#c9a227]/20 px-2 py-0.5 text-[10px] font-bold text-[#c9a227]">
                          {String(row[name])}
                        </span>
                      ) : name === "status" && row[name] ? (
                        <span className="inline-block rounded-full bg-[#c9a227]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#c9a227]">
                          {String(row[name])}
                        </span>
                      ) : name === "isActive" ? (
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            row.isActive
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {row.isActive ? "ظاهر" : "مخفي"}
                        </span>
                      ) : (
                        cellText(fieldsByName.get(name), row[name])
                      )}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-center align-middle">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* زر التعديل */}
                      <button
                        onClick={() => startEdit(row)}
                        className="rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 p-1.5 text-[#c9a227] transition hover:bg-[#c9a227] hover:text-[#0f0f0f]"
                        title="تعديل"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* زر إظهار / إخفاء */}
                      {"isActive" in row && (
                        <button
                          onClick={() => void toggleActive(row)}
                          className={`rounded-lg p-1.5 transition ${
                            row.isActive
                              ? "text-[#f5f0e6]/60 hover:text-yellow-400 hover:bg-yellow-500/10"
                              : "text-green-400 hover:bg-green-500/10"
                          }`}
                          title={row.isActive ? "إخفاء من الموقع" : "إظهار في الموقع"}
                        >
                          {row.isActive ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}

                      {/* زر الحذف */}
                      <button
                        onClick={() => setDeleteConfirmRow(row)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 transition hover:bg-red-500 hover:text-white"
                        title="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة التأكيد قبل الحذف (Delete Confirmation Modal) */}
      {deleteConfirmRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-[#141414] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#f5f0e6]">تأكيد الحذف</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#f5f0e6]/70">
              هل أنت متأكد من حذف «
              <span className="font-bold text-[#c9a227]">
                {String(
                  deleteConfirmRow.nameAr ||
                    deleteConfirmRow.titleAr ||
                    deleteConfirmRow.customerName ||
                    deleteConfirmRow.alt ||
                    deleteConfirmRow.id
                )}
              </span>
              »؟ لا يمكن التراجع عن هذه العملية.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => void confirmDelete()}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-red-700"
              >
                نعم، احذف الآن
              </button>
              <button
                onClick={() => setDeleteConfirmRow(null)}
                className="rounded-xl border border-[#f5f0e6]/20 bg-[#1a1a1a] px-5 py-2 text-xs font-semibold text-[#f5f0e6]/70 hover:text-[#f5f0e6]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
