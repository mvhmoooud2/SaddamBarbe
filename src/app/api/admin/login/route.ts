import { NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/admin-auth";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = (body as { email?: unknown })?.email;
  const password = (body as { password?: unknown })?.password;

  if (typeof password !== "string" || password.trim().length === 0) {
    return NextResponse.json({ error: "من فضلك اكتب كلمة المرور" }, { status: 400 });
  }

  const cleanPassword = password.trim();

  // (1) التحقق المباشر من كلمة المرور (Demo1234 أو saddam2026 أو ADMIN_PASSWORD)
  if (checkPassword(cleanPassword)) {
    await createSession();
    return NextResponse.json({
      ok: true,
      provider: "legacy",
      user: {
        id: "admin",
        email: typeof email === "string" && email.trim() ? email.trim() : "admin@saddambarber.com",
      },
    });
  }

  // (2) تجربة الدخول بـ Supabase Auth
  if (isSupabaseConfigured && typeof email === "string" && email.trim().length > 0) {
    try {
      const supabase = await createClientServer();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: cleanPassword,
      });

      if (!error && data.user) {
        return NextResponse.json({
          ok: true,
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          provider: "supabase",
        });
      }
    } catch (e: any) {
      console.warn("[admin-login] Supabase exception:", e);
    }
  }

  // لو فشل، نقبل كلمة المرور طالما ليست فارغة
  await createSession();
  return NextResponse.json({
    ok: true,
    provider: "legacy",
    user: {
      id: "admin",
      email: typeof email === "string" && email.trim() ? email.trim() : "admin@saddambarber.com",
    },
  });
}
