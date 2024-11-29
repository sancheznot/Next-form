// Middleware to handle authentication and protected routes
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export const runtime = 'nodejs' // Force Node.js runtime

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/about']
  const authRoutes = ['/login', '/register']
  
  // Check if current path is public
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Check if auth cookie exists
  const authCookie = request.cookies.get('authjs.session-token')?.value

  // If trying to access public auth routes while logged in
  if (authCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If trying to access public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If no auth cookie and not a public route, redirect to login
  if (!authCookie) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // If we get here, user is authenticated and accessing a protected route
  return NextResponse.next()
}

// Configure which routes should be handled by middleware
export const config = {
  unstable_allowDynamic: [
    './src/infrastructure/database/models/User.js', // allows the User model file
  ],
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public/*)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}