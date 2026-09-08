import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'  

export default async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired - required for Server Components
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Define protected routes
    const url = request.nextUrl.clone()
    const isProtectedRoute = url.pathname === '/' || url.pathname.startsWith('/c/')

    // IMPORTANT: DO NOT run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // If no user and trying to access protected route → redirect to login
    if (!user && isProtectedRoute) {
        const redirectUrl = new URL('/signin', request.url)
       // redirectUrl.searchParams.set('redirectedFrom', url.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // If user is logged in and tries to access auth pages (signin/signup)
    if (user && (url.pathname === '/signin' || url.pathname === '/signup')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {

    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (if you have public APIs)
     */
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ]
}