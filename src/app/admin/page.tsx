"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { basePath } from "@/lib/base-path";
import { adminTables, type FieldDef, type TableDef } from "@/lib/admin-fields";

type Row = Record<string, unknown>;

const tabs: TableDef[] = [
  adminTables.offers,
  adminTables.services,
  adminTables.barbers,
  adminTables.testimonials,
  adminTables.appointments,
];

const api = (path: string) => `${basePath}/api/admin${path}`;

function toInputValue(field: FieldDef, value: unknown) {
  if (value === null || value === undefined) return field.type === "boolean" ? false : "";
  if (field.type === "boolean") return Boolean(value);
  if (field.type === "datetime") {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  }
  return String(value);
}

function emptyForm(def: TableDef): Row {
  const form: Row = {};
  for (const field of def.fields) form[field.name] = field.type === "boolean" ? true : "";
  return form;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState(tabs[0].key);
  const [rows, setRows] = useState<Row[]>([]);
  const [settings, setSettings] = useState<Row[]>([]);
  const [form, setForm] = useState<Row>(emptyForm(tabs[0]));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const def = useMemo(() => adminTables[tab], [tab]);
  const isSettings = tab === "settings";

  const notify = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "settings") {
        const res = await fetch(api("/settings"));
        setSettings(res.ok ? await res.json() : []);
      } else {
        const res = await fetch(api(`/${tab}`));
        const data = res.ok ? await res.json() : [];
        setRows(Array.isArray(data) ? data : []);
        if (!res.ok) notify("err", data?.error ?? "تعذّر التحميل");
      }
    } catch {
      notify("err", "تعذّر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetch(api("/login"))
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authed) load();
  }, [authed, load]);

  /** تغيير التبويب + تصفير الفورم */
  function selectTab(key: string) {
    setTab(key);
    setEditingId(null);
    if (adminTables[key]) setForm(emptyForm(adminTables[key]));
  }

  async function login(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch(api("/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      setPassword("");
    } else {
      notify("err", "كلمة السر غلط");
    }
  }

  async function logout() {
    await fetch(api("/login"), { method: "DELETE" });
    setAuthed(false);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const url = editingId ? api(`/${tab}/${editingId}`) : api(`/${tab}`);
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      notify("ok", editingId ? "تم الحفظ ✅" : "تمت الإضافة ✅");
      setForm(emptyForm(def));
      setEditingId(null);
      load();
    } else {
      notify("err", data?.error ?? "حصل خطأ");
    }
  }

  async function remove(id: number) {
    if (!confirm("متأكد إنك عايز تمسح ده؟")) return;
    const res = await fetch(api(`/${tab}/${id}`), { method: "DELETE" });
    if (res.ok) {
      notify("ok", "تم الحذف");
      load();
    } else {
      notify("err", "تعذّر الحذف");
    }
  }

  async function toggleActive(row: Row) {
    const res = await fetch(api(`/${tab}/${row.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    if (res.ok) load();
    else notify("err", "تعذّر التعديل");
  }

  function startEdit(row: Row) {
    const next: Row = {};
    for (const field of def.fields) next[field.name] = toInputValue(field, row[field.name]);
    setForm(next);
    setEditingId(Number(row.id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveSetting(key: string, value: string) {
    const res = await fetch(api("/settings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    notify(res.ok ? "ok" : "err", res.ok ? "تم الحفظ ✅" : "تعذّر الحفظ");
  }

  if (authed === null) {
    return (
      <main dir="rtl" className="grid min-h-screen place-items-center bg-neutral-950 text-white">
        <p>جاري التحميل…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main dir="rtl" className="grid min-h-screen place-items-center bg-neutral-950 px-4 text-white">
        <form
          onSubmit={login}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-8"
        >
          <h1 className="text-center text-2xl font-bold text-amber-400">لوحة تحكم صالون صدام</h1>
          <p className="text-center text-sm text-white/60">ادخل كلمة السر علشان تعدّل محتوى الموقع</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة السر"
            className="w-full rounded-lg border border-white/15 bg-neutral-800 px-4 py-3 outline-none focus:border-amber-400"
          />
          <button className="w-full rounded-lg bg-amber-500 px-4 py-3 font-bold text-black hover:bg-amber-400">
            دخول
          </button>
          {message && <p className="text-center text-sm text-red-400">{message.text}</p>}
        </form>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-amber-400">لوحة تحكم صالون صدام</h1>
          <div className="flex gap-2">
            <a href={`${basePath}/`} className="rounded-lg border border-white/15 px-4 py-2 text-sm">
              عرض الموقع
            </a>
            <button onClick={logout} className="rounded-lg border border-white/15 px-4 py-2 text-sm">
              خروج
            </button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2">
          {[...tabs, { key: "settings", label: "إعدادات الموقع" } as TableDef].map((item) => (
            <button
              key={item.key}
              onClick={() => selectTab(item.key)}
              className={`rounded-full px-4 py-2 text-sm ${
                tab === item.key ? "bg-amber-500 font-bold text-black" : "border border-white/15 text-white/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {isSettings ? (
          <section className="space-y-3 rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-lg font-bold">إعدادات عامة</h2>
            {settings.length === 0 && <p className="text-sm text-white/60">مفيش إعدادات لسه.</p>}
            {settings.map((row) => (
              <div key={String(row.key)} className="flex flex-wrap items-center gap-3">
                <label className="w-48 text-sm text-white/70">
                  {String(row.labelAr ?? row.key)}
                </label>
                <input
                  defaultValue={String(row.value ?? "")}
                  onBlur={(e) => saveSetting(String(row.key), e.target.value)}
                  className="flex-1 rounded-lg border border-white/15 bg-neutral-800 px-3 py-2"
                />
              </div>
            ))}
            <p className="text-xs text-white/50">الحفظ بيتم تلقائياً لما تسيب الخانة.</p>
          </section>
        ) : (
          <>
            {!def.readonlyCreate && (
              <form onSubmit={save} className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-6">
                <h2 className="text-lg font-bold">
                  {editingId ? `تعديل ${def.label} #${editingId}` : `إضافة إلى ${def.label}`}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {def.fields.map((field) => (
                    <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <label className="mb-1 block text-sm text-white/70">{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={String(form[field.name] ?? "")}
                          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-neutral-800 px-3 py-2"
                        />
                      ) : field.type === "boolean" ? (
                        <label className="flex items-center gap-2 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={Boolean(form[field.name])}
                            onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })}
                            className="size-4 accent-amber-500"
                          />
                          ظاهر
                        </label>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"}
                          step={field.type === "number" ? "any" : undefined}
                          value={String(form[field.name] ?? "")}
                          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-neutral-800 px-3 py-2"
                        />
                      )}
                      {field.hint && <p className="mt-1 text-xs text-white/45">{field.hint}</p>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-amber-500 px-5 py-2 font-bold text-black hover:bg-amber-400">
                    {editingId ? "حفظ التعديل" : "إضافة"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setForm(emptyForm(def));
                      }}
                      className="rounded-lg border border-white/15 px-5 py-2"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            )}

            <section className="overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900">
              <table className="w-full min-w-[600px] text-right text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="p-3">#</th>
                    {def.fields.filter((f) => f.list).map((f) => (
                      <th key={f.name} className="p-3">{f.label}</th>
                    ))}
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-white/60">جاري التحميل…</td>
                    </tr>
                  )}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-white/60">مفيش بيانات.</td>
                    </tr>
                  )}
                  {rows.map((row) => (
                    <tr key={String(row.id)} className="border-t border-white/5">
                      <td className="p-3 text-white/50">{String(row.id)}</td>
                      {def.fields.filter((f) => f.list).map((f) => (
                        <td key={f.name} className="max-w-[240px] truncate p-3">
                          {f.type === "boolean" ? (
                            <button
                              onClick={() => toggleActive(row)}
                              className={`rounded-full px-3 py-1 text-xs ${
                                row[f.name] ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/60"
                              }`}
                            >
                              {row[f.name] ? "ظاهر" : "مخفي"}
                            </button>
                          ) : f.type === "datetime" && row[f.name] ? (
                            new Date(String(row[f.name])).toLocaleString("ar-EG")
                          ) : (
                            String(row[f.name] ?? "—")
                          )}
                        </td>
                      ))}
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(row)} className="rounded-lg border border-white/15 px-3 py-1 text-xs">
                            تعديل
                          </button>
                          <button onClick={() => remove(Number(row.id))} className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300">
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
