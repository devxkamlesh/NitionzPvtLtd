'use client'

import { useEffect, useState } from 'react'

// Hook to handle client-side number formatting to avoid hydration errors
export function useClientSideFormat() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatCurrency = (amount: number) => {
    if (!isClient) {
      return `₹${amount.toString()}` // Simple format for SSR
    }
    
    // Client-side formatting with Indian locale
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatNumber = (num: number) => {
    if (!isClient) {
      return num.toString() // Simple format for SSR
    }
    
    // Client-side formatting with Indian locale
    return num.toLocaleString('en-IN')
  }

  return { formatCurrency, formatNumber, isClient }
}

// Simple utility for consistent formatting
export const formatIndianCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN')}`
}

export const formatIndianNumber = (num: number) => {
  return num.toLocaleString('en-IN')
}