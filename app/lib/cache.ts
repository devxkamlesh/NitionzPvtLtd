// Production caching utilities

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private maxSize: number = 1000

  set<T>(key: string, data: T, ttlMs: number = 300000): void { // 5 minutes default
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, item] of entries) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Singleton cache instance
export const memoryCache = new MemoryCache()

// Cleanup expired items every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => memoryCache.cleanup(), 5 * 60 * 1000)
}

// Browser storage utilities
export class BrowserCache {
  private prefix: string = 'nitionz_'

  constructor(prefix?: string) {
    if (prefix) this.prefix = prefix
  }

  set(key: string, data: any, ttlMs?: number): boolean {
    if (typeof window === 'undefined') return false

    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs
      }
      
      localStorage.setItem(this.prefix + key, JSON.stringify(item))
      return true
    } catch (error) {
      console.warn('Failed to set localStorage item:', error)
      return false
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const itemStr = localStorage.getItem(this.prefix + key)
      if (!itemStr) return null

      const item = JSON.parse(itemStr)
      
      // Check if expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.delete(key)
        return null
      }

      return item.data as T
    } catch (error) {
      console.warn('Failed to get localStorage item:', error)
      return null
    }
  }

  delete(key: string): boolean {
    if (typeof window === 'undefined') return false

    try {
      localStorage.removeItem(this.prefix + key)
      return true
    } catch (error) {
      console.warn('Failed to delete localStorage item:', error)
      return false
    }
  }

  clear(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix))
      keys.forEach(key => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
      return false
    }
  }

  cleanup(): void {
    if (typeof window === 'undefined') return

    try {
      const now = Date.now()
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix))
      
      keys.forEach(key => {
        try {
          const itemStr = localStorage.getItem(key)
          if (itemStr) {
            const item = JSON.parse(itemStr)
            if (item.ttl && now - item.timestamp > item.ttl) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to cleanup localStorage:', error)
    }
  }
}

export const browserCache = new BrowserCache()

// Cache with automatic refresh
export class RefreshCache<T> {
  private cache: Map<string, CacheItem<T>> = new Map()
  private refreshFunctions: Map<string, () => Promise<T>> = new Map()

  async get(key: string, refreshFn: () => Promise<T>, ttlMs: number = 300000): Promise<T> {
    const cached = this.cache.get(key)
    
    // Return cached data if valid
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    // Store refresh function for background updates
    this.refreshFunctions.set(key, refreshFn)

    // Fetch fresh data
    try {
      const data = await refreshFn()
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttlMs
      })
      return data
    } catch (error) {
      // Return stale data if available
      if (cached) {
        console.warn('Using stale cache data due to refresh error:', error)
        return cached.data
      }
      throw error
    }
  }

  async refresh(key: string): Promise<T | null> {
    const refreshFn = this.refreshFunctions.get(key)
    if (!refreshFn) return null

    try {
      const data = await refreshFn()
      const cached = this.cache.get(key)
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: cached?.ttl || 300000
      })
      return data
    } catch (error) {
      console.error('Failed to refresh cache:', error)
      return null
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    this.refreshFunctions.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.refreshFunctions.clear()
  }
}

// API response caching
export const apiCache = new RefreshCache()

// Utility functions
export const getCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':')
}

export const withCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = 300000
): Promise<T> => {
  // Try memory cache first
  const cached = memoryCache.get<T>(key)
  if (cached) return cached

  // Fetch and cache
  const data = await fetchFn()
  memoryCache.set(key, data, ttlMs)
  return data
}

// React hook for caching
export const useCache = () => {
  return {
    get: memoryCache.get.bind(memoryCache),
    set: memoryCache.set.bind(memoryCache),
    delete: memoryCache.delete.bind(memoryCache),
    clear: memoryCache.clear.bind(memoryCache)
  }
}

export default {
  memoryCache,
  browserCache,
  apiCache,
  RefreshCache,
  getCacheKey,
  withCache,
  useCache
}