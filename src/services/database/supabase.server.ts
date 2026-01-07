import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/models/database";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase server environment variables");
}

// Server client với service role key (bypass RLS)
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Khởi tạo Supabase client
// Dùng key "anon" ở đây để đảm bảo tính bảo mật
// Sẽ được xử lý bằng Row Level Security (RLS) của Supabase
// Và các hàm trong "auth.server.ts"
// export const supabase = createClient(supabaseUrl, supabaseKey);
// URL link: https://jtmzyryaizkoeyufkzfg.supabase.co
// ANON key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bXp5cnlhaXprb2V5dWZremZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzUyNjUsImV4cCI6MjA3NjYxMTI2NX0.TfuqT1wpglEuJ1HVI-8oyghEP3hon25AZf6qdqBGZYg
