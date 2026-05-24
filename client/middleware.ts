import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicAdminRoute = path === '/login'

  // Very basic token check: look for a cookie named 'token'
  // In a real application, you would verify this token properly
  const token = request.cookies.get('token')?.value || ''

  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  if (isPublicAdminRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login'
  ]
}
