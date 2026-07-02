import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data } = await supabase.rpc('is_admin')
    isAdmin = data === true
  }
  const path = request.nextUrl.pathname

  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    return NextResponse.redirect(url)
  }

  // Admin area — must be signed in AND have the admin role
  if (path.startsWith('/admin')) {
    if (!user) return redirectTo('/login')
    if (!isAdmin) return redirectTo('/')
  }

  // Admin login page — send signed-in admins straight to the dashboard
  if (path === '/login' && user && isAdmin) {
    return redirectTo('/admin')
  }

  // Customer account area — must be signed in (login/register are public)
  if (path.startsWith('/account')) {
    const isAuthPage = path === '/account/login' || path === '/account/register'
    if (!user && !isAuthPage) return redirectTo('/account/login')
    if (user && isAuthPage) return redirectTo('/account')
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/account/:path*'],
}
