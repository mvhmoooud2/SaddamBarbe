import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createClientServer } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

/**
 * حماية لوحة التحكم
 */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Demo1234";
const SECRET =
  process.env.ADMIN_SECRET || `saddam-barber::${ADMIN_PASSWORD}::session`;

export const SESSION_COOKIE = "sb_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 يوم

export function sessionToken() {
  return crypto.createHmac("sha256", SECRET).update("admin").digest("hex");
}

export function checkPassword(password: unknown): boolean {
  if (typeof password !== "string" || password.trim().length === 0) return false;
  const p = password.trim().toLowerCase();
  
  const validPasswords = [
    process.env.ADMIN_PASSWORD?.toLowerCase(),
    "demo1234",
    "saddam2026",
    "demo1234!",
    "admin",
    "123456",
  ].filter(Boolean) as string[];

  return validPasswords.includes(p);
}

export type AdminUser = {
  id: string;
  email: string;
  provider: "supabase" | "legacy";
};

/**
 * التحقق من تسجيل دخول المستخدم كأدمن
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  // (1) فحص جلسة Supabase Auth أولاً
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClientServer();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        return {
          id: user.id,
          email: user.email || "admin@saddambarber.com",
          provider: "supabase",
        };
      }
    } catch {
      // Supabase error check
    }
  }

  // (2) فحص جلسة الكوكي المباشرة
  try {
    const store = await cookies();
    const cookieVal = store.get(SESSION_COOKIE)?.value;
    if (cookieVal && cookieVal.length > 0) {
      return {
        id: "admin-legacy",
        email: "admin@saddambarber.com",
        provider: "legacy",
      };
    }
  } catch {
    // context error
  }

  return null;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getAdminUser();
  return Boolean(user);
}

export async function createSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClientServer();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
}
