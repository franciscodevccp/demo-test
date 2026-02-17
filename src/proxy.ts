import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const session = request.cookies.get('user_session')
    const isLoginPage = request.nextUrl.pathname === '/'
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/trabajador')

    // If trying to access protected route without session, redirect to login
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If on login page with session, redirect to appropriate dashboard
    if (isLoginPage && session) {
        try {
            const user = JSON.parse(session.value)
            if (user.rol === 'admin') {
                return NextResponse.redirect(new URL('/admin', request.url))
            } else {
                return NextResponse.redirect(new URL('/trabajador', request.url))
            }
        } catch (e) {
            // Invalid session cookie
            return NextResponse.next()
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
