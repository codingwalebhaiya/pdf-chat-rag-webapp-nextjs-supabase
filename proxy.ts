import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/proxy';

export default async function proxy(request: NextRequest) {
    //     let supabaseResponse = NextResponse.next({
    //         request,
    //     })
    //     const supabase = await createServer();

    //     // Refresh session if expired - required for Server Components
    //     const {
    //         data: { user },
    //     } = await supabase.auth.getUser()

    //     // Define protected routes
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

    //     return supabaseResponse
    // }

    return await updateSession(request);

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
        '/((?!api/inngest|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ]
}


// complete flow for server component with supabase auth -:
// Request
//    ↓
// proxy.ts
//    ↓
// updateSession()
//    ↓
// getClaims()
//    ↓
// continue / redirect


// why proxy exists:
// imagine the access token is expired, and you are on a protected route,
// without this proxy, you will be redirected to the login page.
// with this proxy, you will be able to refresh the access token and continue.
// Proxy is the only way to handle the session-refresh mechanism in SSR.

//for example this flow - 
// User
//  │
//  │ GET /dashboard
//  ▼
// proxy.ts
//  │
//  ▼
// Supabase
//  │
//  ├── token valid
//  │
//  └── token needs refresh
//           │
//           ▼
//        refresh
//           │
//           ▼
//     new access/refresh tokens in auth cookie
//       │
//       ▼
// Continue to dashboard


// what is SSR ?
// Server-Side Rendering (SSR) is a web development technique
//  where the initial HTML page is generated on the server before being sent to the client's browser.
//  In contrast, Client-Side Rendering (CSR) renders the page in the browser using JavaScript.

// SSR Process with this proxy middleware :- (for server components)
// 1. request hits server
// 2. proxy middleware runs
// 3. updates session/refresh token
// 4. returns response
// 5. server renders page
// 6. response sent to client


// what is CSR ? (Client Side Rendering)
// Client-Side Rendering (CSR) is a web development technique
// where the initial HTML page is generated on the client's browser using JavaScript.

// CSR Process with this proxy middleware :- (for client components)
// 1. request hits server
// 2. proxy middleware runs
// 3. updates session/refresh token
// 4. returns response
// 5. client renders page
// 6. response sent to client

// which is better SSR or CSR ?
// SSR is better for SEO and initial page load.
// CSR is better for user experience and interactivity.

// What is SSG ? (Static Site Generation)
// Static Site Generation (SSG) is a web development technique
// where the initial HTML page is generated at build time before being sent to the client's browser.

// SSG Process with this proxy middleware :- (for static components)
// 1. request hits server
// 2. proxy middleware runs
// 3. updates session/refresh token
// 4. returns response
// 5. server renders page
// 6. response sent to client

// what is ISR ? (Incremental Static Regeneration)
// Incremental Static Regeneration (ISR) is a web development technique
// where the initial HTML page is generated at build time before being sent to the client's browser.
// and then updated incrementally after build time.

// ISR Process with this proxy middleware :- (for incremental components)
// 1. request hits server
// 2. proxy middleware runs
// 3. updates session/refresh token
// 4. returns response
// 5. server renders page
// 6. response sent to client 


// which is better SSR or CSR or SSG or ISR ?
// It depends on the use case.
// If SEO is important, then SSR or SSG is better.
// If user experience is important, then CSR is better.
// If performance is important, then SSG is better.
// If dynamic content is important, then ISR is better.

// What is SSG vs SSR ?
// SSG is generated at build time, SSR is generated at request time.

// What is CSR vs ISR ?
// CSR is generated at request time, ISR is generated at build time and updated incrementally after build time.

// What is CSR vs SSG ?
// CSR is generated at request time, SSG is generated at build time.

// What is CSR vs SSR vs SSG vs ISR ?
// CSR is generated at request time, SSR is generated at request time, SSG is generated at build time, ISR is generated at build time and updated incrementally after build time.

// When to use what ?
// Use CSR when you need real-time data and interactivity.
// Use SSR when you need SEO and initial page load.
// Use SSG when you need performance and SEO.
// Use ISR when you need dynamic content and SEO.

// What is SPA ? (Single Page Application)
// SPA is a web development technique
// where the initial HTML page is generated at build time before being sent to the client's browser.
// and then updated incrementally after build time.

// SPA Process with this proxy middleware :- (for spa components)
// 1. request hits server
// 2. proxy middleware runs
// 3. updates session/refresh token
// 4. returns response
// 5. server renders page
// 6. response sent to client


// NOTE :-
// Without this session-refresh mechanism, users can unexpectedly get signed out during SSR. 
// Supabase explicitly describes Proxy as the mechanism 
// that refreshes the Auth token and passes the refreshed cookie to the browser/server.