import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  isSupabaseConfigured,
} from "./config";

/**
 * عميل Supabase بصلاحيات السيرفر الكاملة (Service Role).
 * ⚠️ لا يُستخدم إلا في ملفات السيرفر والـ API routes — لا يُرسل للـ Frontend أبداً.
 */
export function createAdminClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  return createSupabaseClient<Database>(SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
