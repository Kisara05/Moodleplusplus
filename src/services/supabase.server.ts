import { createClient } from "@supabase/supabase-js";

// Lấy biến môi trường (chỉ chạy trên server)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or Key");
}

// Khởi tạo Supabase client
// Dùng key "anon" ở đây để đảm bảo tính bảo mật
// Sẽ được xử lý bằng Row Level Security (RLS) của Supabase
// Và các hàm trong "auth.server.ts"
export const supabase = createClient(supabaseUrl, supabaseKey);

