import { createBrowserClient } from "@supabase/ssr";

//Use: Creates a Supabase client for Client Components that run in the user's browser. 
//How it works: It automatically reads and writes authentication cookies locally in the browser

// Note - Rule of thumb: If you see "use client" at the top of the file → use createClient(). If you see "use server" or no directive → use createServer().

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )
}

