"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل الدخول");
      window.location.reload();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "فشل الدخول");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-[#c9a227]/25 bg-[#1a1a1a] p-8"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a227]/15 text-[#c9a227]">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black text-[#f5f0e6]">لوحة تحكم الصالون</h1>
          <p className="mt-2 text-xs text-[#f5f0e6]/50">
            اكتب كلمة السر علشان تعدّل محتوى الموقع
          </p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="كلمة السر"
          autoFocus
          className="w-full rounded-xl border border-[#c9a227]/25 bg-[#0f0f0f] px-4 py-3 text-center text-[#f5f0e6] outline-none focus:border-[#c9a227]"
        />

        {error && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9a227] px-5 py-3 font-bold text-[#0f0f0f] disabled:opacity-60"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          دخول
        </button>
      </form>
    </div>
  );
}
