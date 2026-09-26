import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "saddam_admin";

/** كلمة سر لوحة التحكم — عدّلها من متغير البيئة ADMIN_PASSWORD */
export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "saddam-admin";
}

/** توكن الجلسة = بصمة لكلمة السر (لو اتغيرت كلمة السر، كل الجلسات بتقع) */
export function sessionToken() {
  return createHash("sha256")
    .update(`saddam-barber::${adminPassword()}`)
    .digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function isAuthenticated() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return Boolean(token && safeEqual(token, sessionToken()));
}

export function checkPassword(input: unknown) {
  return typeof input === "string" && safeEqual(input, adminPassword());
}
