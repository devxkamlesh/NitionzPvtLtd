// Production security utilities

import { NextRequest } from 'next/server'

// Rate limiting
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  isAllowed(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || []
    
    // Filter out old requests
    const recentRequests = userRequests.filter(time => time > windowStart)
    
    // Check if under limit
    if (recentRequests.length >= config.maxRequests) {
      return false
    }
    
    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    return true
  }

  cleanup() {
    const now = Date.now()
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter((time: number) => now - time < 3600000) // Keep 1 hour
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// Clean up old entries every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 10 * 60 * 1000)
}

// Input validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validateAmount = (amount: number): boolean => {
  return typeof amount === 'number' && 
         amount > 0 && 
         amount <= 10000000 && // 1 crore max
         Number.isFinite(amount)
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(pan.toUpperCase())
}

export const validateAadhaar = (aadhaar: string): boolean => {
  const aadhaarRegex = /^\d{12}$/
  return aadhaarRegex.test(aadhaar.replace(/\s/g, ''))
}

// CSRF protection
export const generateCSRFToken = (): string => {
  if (typeof window !== 'undefined') {
    return btoa(Math.random().toString()).substring(0, 32)
  }
  return require('crypto').randomBytes(32).toString('hex')
}

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length >= 16
}

// Request validation
export const validateRequest = (request: NextRequest) => {
  const userAgent = request.headers.get('user-agent') || ''
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Block suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ]
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))
  
  // Validate origin for POST requests
  const isValidOrigin = !origin || 
    origin.includes(process.env.NEXT_PUBLIC_APP_URL || 'localhost')
  
  return {
    isValid: !isSuspicious && isValidOrigin,
    userAgent,
    origin,
    referer
  }
}

// Content Security Policy
export const getCSPHeader = () => {
  const isDev = process.env.NODE_ENV === 'development'
  
  return [
    "default-src 'self'",
    `script-src 'self' ${isDev ? "'unsafe-eval'" : ''} 'unsafe-inline' https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://api.cloudinary.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
}

// API key validation
export const validateApiKey = (apiKey: string): boolean => {
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || []
  return validApiKeys.includes(apiKey)
}

// Session security
export const generateSecureSessionId = (): string => {
  if (typeof window !== 'undefined') {
    return btoa(Date.now() + Math.random().toString()).replace(/[^a-zA-Z0-9]/g, '')
  }
  return require('crypto').randomBytes(32).toString('hex')
}

// File upload validation
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 5MB limit' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed' }
  }
  
  return { isValid: true }
}

// Password strength validation
export const validatePasswordStrength = (password: string): { 
  isValid: boolean; 
  score: number; 
  feedback: string[] 
} => {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score += 1
  else feedback.push('Password should be at least 8 characters long')
  
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Include lowercase letters')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Include uppercase letters')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('Include numbers')
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('Include special characters')
  
  return {
    isValid: score >= 4,
    score,
    feedback
  }
}

export default {
  rateLimiter,
  validateEmail,
  validatePhone,
  validateAmount,
  sanitizeInput,
  validatePAN,
  validateAadhaar,
  generateCSRFToken,
  validateCSRFToken,
  validateRequest,
  getCSPHeader,
  validateApiKey,
  generateSecureSessionId,
  validateFileUpload,
  validatePasswordStrength
}