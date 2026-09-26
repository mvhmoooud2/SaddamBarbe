import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * حماية بسيطة للوحة التحكم بكلمة سر واحدة.
 *
 * كلمة السر بتتقرا من متغير البيئة ADMIN_PASSWORD، ولو مش موجود
 * بتبقى القيمة الافتراضية «saddam2026» — غيّرها في ملف .env قبل النشر.
 */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "saddam2026";
const SECRET =
  process.env.ADMIN_SECRET || `saddam-barber::${ADMIN_PASSWORD}::session`;

export const SESSION_COOKIE = "sb_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 يوم

export function sessionToken() {
  return crypto.createHmac("sha256", SECRET).update("admin").digest("hex");
}

export function checkPassword(password: unknown) {
  if (typeof password !== "string" || password.length === 0) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAuthenticated() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === sessionToken();
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
}
