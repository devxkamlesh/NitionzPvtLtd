import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiter, validateRequest, getCSPHeader } from './lib/security'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Content-Security-Policy', getCSPHeader())
  
  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = request.ip || 'anonymous'
    const isAllowed = rateLimiter.isAllowed(identifier, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100 // 100 requests per 15 minutes
    })
    
    if (!isAllowed) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '900' // 15 minutes
        }
      })
    }
  }
  
  // Stricter rate limiting for auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    const identifier = request.ip || 'anonymous'
    const isAllowed = rateLimiter.isAllowed(`auth_${identifier}`, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10 // 10 auth requests per 15 minutes
    })
    
    if (!isAllowed) {
      return new NextResponse('Too Many Authentication Requests', { 
        status: 429,
        headers: {
          'Retry-After': '900'
        }
      })
    }
  }
  
  // Request validation
  const validation = validateRequest(request)
  if (!validation.isValid) {
    return new NextResponse('Invalid Request', { status: 400 })
  }
  
  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Add additional admin-specific security checks here
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  }
  
  // Test route protection (disable in production)
  if (request.nextUrl.pathname.startsWith('/test') && process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 })
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}