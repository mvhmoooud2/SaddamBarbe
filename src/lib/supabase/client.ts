import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * عميل Supabase للمتصفح (Browser Client).
 * بيستخدم ANON_KEY فقط، وبيخزن الـ Session في Cookies/localStorage تلقائياً.
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    // عميل وهمي آمن لو Supabase لسه ماتهيأش علشان الصفحة ماتعلقش
    return createSupabaseClient<Database>(
      "https://dummy.supabase.co",
      "dummy-anon-key"
    );
  }

  if (typeof window === "undefined") {
    return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return clientInstance;
}
