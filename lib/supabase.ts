import { createClient } from "@supabase/supabase-js";
import { createLocalSupabaseClient } from "@/lib/localSupabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase: any =
  process.env.NEXT_PUBLIC_USE_LOCAL_DB === "true"
    ? createLocalSupabaseClient()
    : createClient(supabaseUrl, supabaseAnonKey);
