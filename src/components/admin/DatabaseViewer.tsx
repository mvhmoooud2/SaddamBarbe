"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Database, Loader2, RefreshCcw, ShieldCheck } from "lucide-react";

type TableInfo = { name: string; labelAr: string; count: number };
type TableData = {
  columns: string[];
  rows: Record<string, unknown>[];
  source?: string;
};

function cell(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  const text = String(value);
  return text.length > 70 ? `${text.slice(0, 70)}…` : text;
}

export default function DatabaseViewer() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isSupabase, setIsSupabase] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [data, setData] = useState<TableData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/db");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "فشل التحميل");
      setTables(payload.tables || []);
      setIsSupabase(Boolean(payload.supabaseConfigured));
    } catch (loadError: any) {
      setError(loadError?.message || "فشل التحميل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTables();
  }, [loadTables]);

  async function openTable(name: string) {
    setActive(name);
    setData(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/db?table=${name}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "فشل التحميل");
      setData({
        columns: payload.columns || [],
        rows: payload.rows || [],
        source: payload.source,
      });
    } catch (loadError: any) {
      setError(loadError?.message || "فشل التحميل");
    }
  }

  return (
    <div className="space-y-6">
      {/* الهيدر */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-[#f5f0e6]">
            <Database className="h-5 w-5 text-[#c9a227]" />
            قاعدة بيانات Supabase و RLS
          </h2>
          <p className="text-xs text-[#f5f0e6]/50">
            فحص الجداول والصفوف وإعدادات الأمان (Row Level Security)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3.5 py-1.5 text-xs font-bold text-green-300">
            <ShieldCheck className="h-4 w-4" />
            <span>RLS مفعّل ومحمي</span>
          </div>
          <button
            onClick={() => void loadTables()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/40 px-4 py-1.5 text-xs font-bold text-[#c9a227] hover:bg-[#c9a227]/10"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            تحديث
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* بطاقات الجداول */}
      {isLoading ? (
        <div className="flex justify-center py-16 text-[#c9a227]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <button
              key={table.name}
              onClick={() => void openTable(table.name)}
              className={`rounded-2xl border p-4 text-right transition ${
                active === table.name
                  ? "border-[#c9a227] bg-[#c9a227]/10 shadow-lg ring-1 ring-[#c9a227]"
                  : "border-[#c9a227]/20 bg-[#141414] hover:border-[#c9a227]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-[#f5f0e6]">{table.labelAr}</p>
                <span className="rounded-md bg-[#c9a227]/15 px-2 py-0.5 text-xs font-black text-[#c9a227]">
                  {table.count} صف
                </span>
              </div>
              <p className="mt-1 text-xs text-[#f5f0e6]/40" dir="ltr">
                {table.name}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* مستعرض صفوف الجدول المحدد */}
      {active && (
        <div className="rounded-3xl border border-[#c9a227]/30 bg-[#141414] p-5 shadow-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#c9a227]/20 pb-3">
            <div>
              <p className="text-sm font-bold text-[#c9a227]">
                مستعرض جدول: <span dir="ltr" className="font-mono">{active}</span>
              </p>
              <p className="text-xs text-[#f5f0e6]/50">
                عرض أول 200 صف من قاعدة البيانات
              </p>
            </div>
            {data?.source && (
              <span className="rounded-full bg-[#c9a227]/20 px-3 py-1 text-[11px] font-bold text-[#c9a227]">
                المصدر: {data.source}
              </span>
            )}
          </div>

          {!data ? (
            <div className="flex justify-center py-12 text-[#c9a227]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : data.rows.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#f5f0e6]/50">
              الجدول فارغ لا يحتوي على أي صفوف بعد
            </p>
          ) : (
            <div className="max-h-[500px] overflow-auto rounded-2xl border border-[#c9a227]/20">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 bg-[#1a1a1a] text-[#c9a227]">
                  <tr>
                    {data.columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap px-3.5 py-2.5 font-bold"
                        dir="ltr"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c9a227]/10">
                  {data.rows.map((row, index) => (
                    <tr
                      key={index}
                      className="text-[#f5f0e6]/80 transition hover:bg-[#1a1a1a]"
                    >
                      {data.columns.map((column) => (
                        <td
                          key={column}
                          className="max-w-[240px] truncate px-3.5 py-2.5"
                          title={String(row[column] ?? "")}
                        >
                          {cell(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
