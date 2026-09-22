import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";


// Define protected routes
//     const url = request.nextUrl.clone()
//     const isProtectedRoute = url.pathname === '/' || url.pathname.startsWith('/c/')

//     // IMPORTANT: DO NOT run code between createServerClient and
//     // supabase.auth.getUser(). A simple mistake could make it very hard to debug
//     // issues with users being randomly logged out.

//     // If no user and trying to access protected route → redirect to login
//     if (!user && isProtectedRoute) {
//         const redirectUrl = new URL('/signin', request.url)
//         // redirectUrl.searchParams.set('redirectedFrom', url.pathname)
//         return NextResponse.redirect(redirectUrl)
//     }

//     // If user is logged in and tries to access auth pages (signin/signup)
//     if (user && (url.pathname === '/signin' || url.pathname === '/signup')) {
//         return NextResponse.redirect(new URL('/', request.url))
//     }

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },

                setAll(cookiesToSet, headers) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    supabaseResponse = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(
                        ({ name, value, options }) => {
                            supabaseResponse.cookies.set(
                                name,
                                value,
                                options
                            );
                        }
                    );

                    Object.entries(headers).forEach(
                        ([key, value]) => {
                            supabaseResponse.headers.set(key, value);
                        }
                    );
                },
            },
        }
    );

    const { data } = await supabase.auth.getClaims();

    const user = data?.claims;

    if (
        !user &&
        !request.nextUrl.pathname.startsWith("/signin") &&
        !request.nextUrl.pathname.startsWith("/signup")
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/signin";
        return NextResponse.redirect(url);
    }

    // If user is logged in and tries to access auth pages (signin/signup)
    if (user && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup')) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}


// NOTE :- This follows the current Supabase SSR pattern:
//  getClaims() verifies the token, and Proxy propagates refreshed cookies to both the request and response.
//  Supabase explicitly warns against relying on getSession() in server-side protection 
//  because it reads session information from the cookie without revalidating it