import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

/**
 * عميل Supabase للسيرفر (Server Components & Route Handlers).
 * بيتعامل مع Next.js Cookies لتسجيل الدخول وقراءة جلسة المستخدم بـ SSR.
 */
export async function createClientServer() {
  if (!isSupabaseConfigured) {
    return createSupabaseClient<Database>(
      "https://dummy.supabase.co",
      "dummy-anon-key",
      { auth: { persistSession: false } }
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // يمكن تجاهلها لو بيتم استدعاؤها من Server Component غير قادر على تعديل الـ Cookies
        }
      },
    },
  });
}
