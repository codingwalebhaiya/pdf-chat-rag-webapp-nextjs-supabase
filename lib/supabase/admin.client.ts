import { createClient } from "@supabase/supabase-js";

// Note - This creates a client for server-side code that needs admin (service role) access to the database. Use this for things like creating embeddings in the background, managing file metadata, or any operation that bypasses RLS.
// This is different from createServer() and create(), which are used for authenticated user operations.

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,// Secret admin key
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    }
) 