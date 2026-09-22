import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

//Create Supabase server client
export async function createClient() {
    const cookieStore = await cookies();

    //use: Creates a Supabase client for Server Components that run on the server. 
    //how: It uses the native Node.js `cookies` API from Next.js instead of the browser-based Web Cookies API.

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet, _headers) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    } catch (error) {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing user sessions.
                        // Server Components cannot always modify cookies.
                        // Proxy handles session refresh.

                    }
                }
            }
        }
    )

}


// NOTE :- createServerClient (server.ts) is used by server components, server actions , route handlers  because all of these run on the server not in the browser.
// createClient (client.ts) is used by client components because they run in the browser.
// for proxy refer 'https://supabase.com/docs/guides/auth/server-side-helpers/nextjs-app-router#proxy-session-state-to-the-client' 

// getAll() & setAll() creates the bridge between supbase auth and next js cookies.
// When a user logs in via supabase auth, it sets cookies in the browser. 
// These cookies are then read by getAll() and sent to the supabase client. 
// When the user logs out, it deletes the cookies from the browser.

// for example user signIn process:
//    user
//    │
//    ▼
// email
// password
//    │
//    ▼
// signInWithPassword() [ server action ]
//    │
//    ▼
// Supabase Auth (session)
//    │
//    ▼
// store session
//    │
//    ▼
//  browser cookie {access token, refresh token, expiry, etc.} 
//   (set by supabase in browser)

// and later when user tries to access any protected route or resource -> process:

// Browser
//    │
//    │ Cookie (access token)
//    ▼
// Next.js (createClient() reads the cookie)
//    │
//    ▼
// Supabase (verifies the token) -> user is authorized
//    │
//    ▼
// sends response to Next.js  
//    │
//    ▼
// user session is now available in server components, server actions, route handlers


