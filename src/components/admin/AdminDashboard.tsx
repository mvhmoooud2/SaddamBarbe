"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  Check,
  Database,
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Scissors,
  Settings2,
  ShieldCheck,
  Star,
  Tag,
  User,
  Users,
  X,
} from "lucide-react";
import { adminResources } from "@/data/admin-fields";
import ResourceManager from "./ResourceManager";
import SettingsManager from "./SettingsManager";
import DatabaseViewer from "./DatabaseViewer";
import MediaManager from "./MediaManager";
import Overview from "./Overview";

const SETTINGS_TAB = "settings";
const DATABASE_TAB = "database";
const MEDIA_TAB = "media";
const OVERVIEW_TAB = "overview";

const tabIcons: Record<string, any> = {
  services: Scissors,
  offers: Tag,
  branches: MapPin,
  gallery: ImageIcon,
  barbers: Users,
  testimonials: Star,
  appointments: CalendarClock,
};

export default function AdminDashboard({
  onLogout,
}: {
  onLogout?: () => void;
}) {
  const [activeTab, setActiveTab] = useState(OVERVIEW_TAB);
  const [adminUser, setAdminUser] = useState<{ email?: string; provider?: string } | null>(null);
  const [branchOptions, setBranchOptions] = useState<
    { slug: string; name: string }[]
  >([]);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session");
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.user || null);
      }
    } catch {
      // ignore
    }
  }, []);

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
    void loadSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadBranches();
  }, [loadSession, loadBranches]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError("كلمة المرور يجب أن تكون 6 خانات على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("كلمتا المرور غير متطابقتين");
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تغيير كلمة المرور");

      setPasswordNotice("تم تغيير كلمة المرور بنجاح ✅");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordNotice(null);
        setPasswordModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || "فشل تغيير كلمة المرور");
    } finally {
      setPasswordLoading(false);
    }
  }

  const resource = adminResources.find((item) => item.key === activeTab);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e6] pb-20">
      {/* الهيدر العلوي */}
      <header className="sticky top-0 z-40 border-b border-[#c9a227]/20 bg-[#121212]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-[#f5f0e6]">
                لوحة تحكم <span className="text-[#c9a227]">SADDAM BARBER</span>
              </h1>
              <p className="text-[11px] text-[#f5f0e6]/50">
                إدارة المحتوى وقاعدة البيانات الديناميكية (Supabase)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* معلومات المستخدم المسجل */}
            {adminUser?.email && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#c9a227]/20 bg-[#1a1a1a] px-3 py-1 text-xs text-[#f5f0e6]/70">
                <User className="h-3.5 w-3.5 text-[#c9a227]" />
                <span className="font-mono text-[11px]" dir="ltr">
                  {adminUser.email}
                </span>
              </div>
            )}

            {/* زر تغيير كلمة المرور */}
            <button
              onClick={() => {
                setPasswordError(null);
                setPasswordNotice(null);
                setPasswordModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 px-3.5 py-1.5 text-xs font-bold text-[#c9a227] transition hover:bg-[#c9a227] hover:text-[#0f0f0f]"
              title="تغيير كلمة المرور الخاصة بك"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>تغيير كلمة المرور</span>
            </button>

            {/* رابط معاينة الموقع الحي */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 px-3.5 py-1.5 text-xs font-bold text-[#c9a227] transition hover:bg-[#c9a227] hover:text-[#0f0f0f]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>معاينة الموقع</span>
            </a>

            {/* زر تسجيل الخروج */}
            <button
              onClick={() => void logout()}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* شريط التبويبات الرئيسي */}
        <div className="border-t border-[#c9a227]/10 bg-[#0d0d0d]">
          <nav className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-5 py-2.5 scrollbar-none">
            <button
              onClick={() => setActiveTab(OVERVIEW_TAB)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === OVERVIEW_TAB
                  ? "bg-[#c9a227] text-[#0f0f0f] shadow-md shadow-[#c9a227]/20"
                  : "text-[#f5f0e6]/70 hover:bg-[#1a1a1a] hover:text-[#c9a227]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              نظرة عامة
            </button>

            {adminResources.map((item) => {
              const Icon = tabIcons[item.key] || Tag;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-[#c9a227] text-[#0f0f0f] shadow-md shadow-[#c9a227]/20"
                      : "text-[#f5f0e6]/70 hover:bg-[#1a1a1a] hover:text-[#c9a227]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.titleAr}
                </button>
              );
            })}

            <button
              onClick={() => setActiveTab(MEDIA_TAB)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === MEDIA_TAB
                  ? "bg-[#c9a227] text-[#0f0f0f] shadow-md shadow-[#c9a227]/20"
                  : "text-[#f5f0e6]/70 hover:bg-[#1a1a1a] hover:text-[#c9a227]"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              مكتبة الصور
            </button>

            <button
              onClick={() => setActiveTab(SETTINGS_TAB)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === SETTINGS_TAB
                  ? "bg-[#c9a227] text-[#0f0f0f] shadow-md shadow-[#c9a227]/20"
                  : "text-[#f5f0e6]/70 hover:bg-[#1a1a1a] hover:text-[#c9a227]"
              }`}
            >
              <Settings2 className="h-4 w-4" />
              إعدادات الموقع
            </button>

            <button
              onClick={() => setActiveTab(DATABASE_TAB)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === DATABASE_TAB
                  ? "bg-[#c9a227] text-[#0f0f0f] shadow-md shadow-[#c9a227]/20"
                  : "text-[#f5f0e6]/70 hover:bg-[#1a1a1a] hover:text-[#c9a227]"
              }`}
            >
              <Database className="h-4 w-4" />
              قاعدة البيانات
            </button>
          </nav>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="mx-auto max-w-7xl px-5 py-6">
        {activeTab === OVERVIEW_TAB ? (
          <Overview onOpenTab={setActiveTab} />
        ) : activeTab === MEDIA_TAB ? (
          <MediaManager />
        ) : activeTab === DATABASE_TAB ? (
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

      {/* نافذة تغيير كلمة المرور (Modal) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#c9a227]/30 bg-[#141414] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#c9a227]/20 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[#c9a227]" />
                <h3 className="text-base font-bold text-[#f5f0e6]">
                  تغيير كلمة المرور
                </h3>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="rounded-full p-1 text-[#f5f0e6]/60 hover:bg-[#c9a227]/10 hover:text-[#f5f0e6]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#f5f0e6]/80">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-3.5 py-2.5 text-sm text-[#f5f0e6] outline-none focus:border-[#c9a227]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#f5f0e6]/80">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-3.5 py-2.5 text-sm text-[#f5f0e6] outline-none focus:border-[#c9a227]"
                />
              </div>

              {passwordNotice && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center text-xs font-medium text-green-300">
                  {passwordNotice}
                </div>
              )}
              {passwordError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-medium text-red-300">
                  {passwordError}
                </div>
              )}

              <div className="mt-5 flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a227] px-4 py-2.5 text-xs font-bold text-[#0f0f0f] shadow-lg hover:bg-[#e6be3f] disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  حفظ كلمة المرور الجديدة
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="rounded-xl border border-[#f5f0e6]/20 bg-[#1a1a1a] px-4 py-2.5 text-xs font-semibold text-[#f5f0e6]/70 hover:text-[#f5f0e6]"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
