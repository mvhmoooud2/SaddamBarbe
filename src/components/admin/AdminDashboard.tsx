"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, ExternalLink, LogOut, Settings2 } from "lucide-react";
import { adminResources } from "@/data/admin-fields";
import ResourceManager from "./ResourceManager";
import SettingsManager from "./SettingsManager";
import DatabaseViewer from "./DatabaseViewer";

const SETTINGS_TAB = "settings";
const DATABASE_TAB = "database";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(adminResources[0].key);
  const [branchOptions, setBranchOptions] = useState<
    { slug: string; name: string }[]
  >([]);

  const loadBranches = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/branches");
      if (!response.ok) return;
      const rows = await response.json();
      setBranchOptions(
        rows.map((row: { slug: string; nameAr: string }) => ({
          slug: row.slug,
          name: row.nameAr,
        }))
      );
    } catch {
      setBranchOptions([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadBranches();
  }, [loadBranches]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  const resource = adminResources.find((item) => item.key === activeTab);

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-16">
      <header className="sticky top-0 z-30 border-b border-[#c9a227]/20 bg-[#0f0f0f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h1 className="text-lg font-black text-[#c9a227]">
              لوحة تحكم SADDAM BARBER
            </h1>
            <p className="text-xs text-[#f5f0e6]/50">
              عدّل كل حاجة بيشوفها العميل من هنا
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#c9a227]/40 px-4 py-2 text-xs font-bold text-[#c9a227]"
            >
              <ExternalLink className="h-4 w-4" />
              شوف الموقع
            </a>
            <button
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-xs font-bold text-red-400"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 pb-3">
          {adminResources.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                activeTab === item.key
                  ? "bg-[#c9a227] text-[#0f0f0f]"
                  : "border border-[#c9a227]/25 text-[#f5f0e6]/70 hover:text-[#c9a227]"
              }`}
            >
              {item.titleAr}
            </button>
          ))}
          <button
            onClick={() => setActiveTab(SETTINGS_TAB)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === SETTINGS_TAB
                ? "bg-[#c9a227] text-[#0f0f0f]"
                : "border border-[#c9a227]/25 text-[#f5f0e6]/70 hover:text-[#c9a227]"
            }`}
          >
            <Settings2 className="h-4 w-4" />
            إعدادات الموقع
          </button>
          <button
            onClick={() => setActiveTab(DATABASE_TAB)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === DATABASE_TAB
                ? "bg-[#c9a227] text-[#0f0f0f]"
                : "border border-[#c9a227]/25 text-[#f5f0e6]/70 hover:text-[#c9a227]"
            }`}
          >
            <Database className="h-4 w-4" />
            قاعدة البيانات
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6">
        {activeTab === DATABASE_TAB ? (
          <DatabaseViewer />
        ) : activeTab === SETTINGS_TAB ? (
          <SettingsManager />
        ) : resource ? (
          <ResourceManager
            resource={resource}
            branchOptions={branchOptions}
            onChanged={() => {
              if (resource.key === "branches") void loadBranches();
            }}
          />
        ) : null}
      </main>
    </div>
  );
}
