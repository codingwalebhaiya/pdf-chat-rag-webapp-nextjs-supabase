
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Note - Rule of thumb: If you see "use client" at the top of the file → use createClient(). If you see "use server" or no directive → use createServer().

//  createServerClient -> Use: Creates a Supabase client for Server Components, Server Actions, and Route Handlers that run on the server.
// How it works: It safely reads incoming request data to know if a user is logged in.


// cookies -> Use: A Next.js utility that lets your server - side code access and modify HTTP cookies.
// How it works: You pass cookies() into createServerClient so the server can read the user's session cookies and pass new auth tokens back and forth . 

export async function createServer() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    } catch (error) {
                        console.log("Error setting cookies", error);

                    }
                },
            }
        }
    )
}