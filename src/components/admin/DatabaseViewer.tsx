"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Loader2, RefreshCcw } from "lucide-react";

type TableInfo = { name: string; labelAr: string; count: number };
type TableData = { columns: string[]; rows: Record<string, unknown>[] };

function cell(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

/** عرض محتوى جداول قاعدة البيانات (قراءة فقط) من غير أي برنامج خارجي */
export default function DatabaseViewer() {
  const [tables, setTables] = useState<TableInfo[]>([]);
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
      setTables(payload.tables);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "فشل التحميل");
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
      setData({ columns: payload.columns, rows: payload.rows });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "فشل التحميل");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#f5f0e6]">
            <Database className="h-5 w-5 text-[#c9a227]" />
            قاعدة البيانات
          </h2>
          <p className="text-xs text-[#f5f0e6]/50">
            عرض فقط — للتعديل استخدم التبويبات اللي فوق
          </p>
        </div>
        <button
          onClick={() => void loadTables()}
          className="inline-flex items-center gap-2 rounded-full border border-[#c9a227]/40 px-4 py-2 text-xs font-bold text-[#c9a227]"
        >
          <RefreshCcw className="h-4 w-4" />
          تحديث
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10 text-[#c9a227]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tables.map((table) => (
            <button
              key={table.name}
              onClick={() => void openTable(table.name)}
              className={`rounded-2xl border p-4 text-right transition-colors ${
                active === table.name
                  ? "border-[#c9a227] bg-[#c9a227]/10"
                  : "border-[#c9a227]/20 bg-[#1a1a1a] hover:border-[#c9a227]/50"
              }`}
            >
              <p className="font-bold text-[#f5f0e6]">{table.labelAr}</p>
              <p className="mt-1 text-xs text-[#f5f0e6]/45" dir="ltr">
                {table.name}
              </p>
              <p className="mt-2 text-sm font-black text-[#c9a227]">
                {table.count} صف
              </p>
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-[#c9a227]">
            محتوى جدول: <span dir="ltr">{active}</span>{" "}
            <span className="text-xs font-normal text-[#f5f0e6]/40">
              (أول 200 صف)
            </span>
          </p>
          {!data ? (
            <div className="flex justify-center py-8 text-[#c9a227]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="max-h-[520px] overflow-auto rounded-2xl border border-[#c9a227]/20">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 bg-[#1a1a1a] text-[#c9a227]">
                  <tr>
                    {data.columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap px-3 py-2 font-bold"
                        dir="ltr"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, index) => (
                    <tr
                      key={index}
                      className="border-t border-[#c9a227]/10 text-[#f5f0e6]/80"
                    >
                      {data.columns.map((column) => (
                        <td
                          key={column}
                          className="max-w-[260px] truncate px-3 py-2"
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
