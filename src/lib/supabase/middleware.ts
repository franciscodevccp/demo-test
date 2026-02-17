import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes - only check if user exists, role check happens in layout
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/trabajador')

    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // Only redirect from login page - this is the only place we need to check role
    if (user && request.nextUrl.pathname === '/') {
        // Get user profile to determine role (only on login page)
        const { data: profile } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', user.id)
            .single()

        const url = request.nextUrl.clone()
        url.pathname = profile?.rol === 'admin' ? '/admin' : '/trabajador'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
