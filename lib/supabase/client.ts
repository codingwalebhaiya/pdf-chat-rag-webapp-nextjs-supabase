import { createBrowserClient } from "@supabase/ssr";

//Create Supabase browser client
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )
}


//Use: Creates a Supabase client for Client Components that run in the user's browser. 
//How it works: It automatically reads and writes authentication cookies locally in the browser

// Note - Rule of thumb: If you see "use client" at the top of the file → use createClient(). If you see "use server" or no directive → use createClient() - server.
// Supabase specifically recommends separate browser and server clients for Next.js SSR