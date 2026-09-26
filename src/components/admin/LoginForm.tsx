"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function LoginForm({
  onLoginSuccess,
}: {
  onLoginSuccess?: () => void;
}) {
  const [email, setEmail] = useState("admin@saddambarber.com");
  const [password, setPassword] = useState("Demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  async function submit(event?: React.FormEvent) {
    if (event) event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || "admin@saddambarber.com",
          password: password.trim() || "Demo1234",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل تسجيل الدخول");

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        window.location.reload();
      }
    } catch (loginError: any) {
      setError(loginError?.message || "فشل تسجيل الدخول");
      setLoading(false);
    }
  }

  function quickLogin() {
    setEmail("admin@saddambarber.com");
    setPassword("Demo1234");
    setTimeout(() => {
      void submit();
    }, 50);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="w-full max-w-md">
        {/* بطاقة تسجيل الدخول */}
        <div className="rounded-3xl border border-[#c9a227]/30 bg-[#141414] p-8 shadow-2xl backdrop-blur">
          {/* الشعار والهيدر */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9a227]/30 bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 text-[#c9a227] shadow-lg">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-[#f5f0e6]">
              لوحة تحكم <span className="text-[#c9a227]">SADDAM BARBER</span>
            </h1>
            <p className="mt-2 text-xs text-[#f5f0e6]/60">
              تسجيل دخول آمن بواسطة Supabase Authentication
            </p>
          </div>

          {/* زر الدخول المباشر بنقرة واحدة */}
          <button
            type="button"
            onClick={quickLogin}
            disabled={isLoading}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c9a227]/40 bg-gradient-to-r from-[#c9a227]/20 via-[#c9a227]/10 to-[#c9a227]/20 p-3.5 text-xs font-bold text-[#c9a227] shadow-sm transition hover:bg-[#c9a227]/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4 text-[#c9a227]" />
            <span>⚡ دخول مباشر سريع (Demo1234)</span>
          </button>

          <form onSubmit={submit} className="space-y-4">
            {/* حقل البريد الإلكتروني */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#f5f0e6]/80">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@saddambarber.com"
                  dir="ltr"
                  className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-4 py-3 pl-10 text-sm text-[#f5f0e6] placeholder-[#f5f0e6]/30 outline-none transition focus:border-[#c9a227]"
                />
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#f5f0e6]/40" />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#f5f0e6]/80">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Demo1234"
                  required
                  className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-4 py-3 pl-10 text-sm text-[#f5f0e6] placeholder-[#f5f0e6]/30 outline-none transition focus:border-[#c9a227]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-[#f5f0e6]/40 hover:text-[#c9a227]"
                  aria-label="إظهار/إخفاء كلمة المرور"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-medium text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e6be3f] px-5 py-3.5 text-sm font-bold text-[#0f0f0f] shadow-lg shadow-[#c9a227]/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول إلى لوحة التحكم
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#c9a227]/10 pt-4 text-center">
            <p className="text-[11px] text-[#f5f0e6]/50">
              كلمة المرور الحالية: <span className="font-bold text-[#c9a227]">Demo1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
