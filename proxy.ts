import { NextRequest, NextResponse } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = ['/profile', '/settings']

// Public routes (accessible to everyone)
const publicRoutes = ['/', '/login']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Skip API routes, static files, images
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/images') ||
    path.startsWith('/fonts') ||
    path.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = req.cookies.get('cloddy-session')?.value
  const isAuthenticated = !!sessionCookie

  // Check route types
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )
  const isPublicRoute = publicRoutes.includes(path)

  // For now, allow all routes (demo mode handled client-side)
  // Uncomment below for strict authentication:

  // if (isProtectedRoute && !isAuthenticated) {
  //   return NextResponse.redirect(new URL('/login', req.nextUrl))
  // }

  // Redirect authenticated users away from login
  if (path === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

// Routes proxy should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
}
