import { createBrowserClient } from "@supabase/ssr";

//Use: Creates a Supabase client for Client Components that run in the user's browser. 
//How it works: It automatically reads and writes authentication cookies locally in the browser

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
}