import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Log for debugging
    console.log('🔒 Middleware checking:', req.nextUrl.pathname)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthenticated = !!token
        console.log('🔐 Auth check:', req.nextUrl.pathname, 'Authenticated:', isAuthenticated)
        return isAuthenticated
      }
    },
    pages: {
      signIn: '/auth/login',
    }
  }
)

// Protect ALL routes except auth pages
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /auth/login (login page)
     * - /auth/signup (signup page)
     * - /api/auth/* (NextAuth API routes)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt, etc.
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|auth/login|auth/signup).*)',
  ],
}
