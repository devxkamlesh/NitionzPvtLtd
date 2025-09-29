// Production monitoring and analytics

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  userId?: string
  sessionId: string
}

interface ErrorLog {
  message: string
  stack?: string
  timestamp: number
  userId?: string
  sessionId: string
  url: string
  userAgent: string
}

class ProductionMonitoring {
  private sessionId: string
  private userId?: string
  private metrics: PerformanceMetric[] = []
  private errors: ErrorLog[] = []

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeMonitoring()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeMonitoring() {
    // Performance monitoring
    if (typeof window !== 'undefined') {
      // Page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          if (navigation) {
            this.trackMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart)
            this.trackMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart)
            this.trackMetric('first_contentful_paint', this.getFirstContentfulPaint())
          }
        }, 0)
      })

      // Error monitoring
      window.addEventListener('error', (event) => {
        this.trackError({
          message: event.message,
          stack: event.error?.stack,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          userId: this.userId,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      })

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          userId: this.userId,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      })

      // Resource loading errors
      window.addEventListener('error', (event) => {
        if (event.target !== window) {
          this.trackError({
            message: `Resource loading error: ${(event.target as any)?.src || (event.target as any)?.href}`,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        }
      }, true)
    }
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcpEntry ? fcpEntry.startTime : 0
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  trackMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    }

    this.metrics.push(metric)

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendMetricToService(metric)
    } else {
      console.log('📊 Performance Metric:', metric)
    }
  }

  trackError(error: ErrorLog) {
    this.errors.push(error)

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToService(error)
    } else {
      console.error('🚨 Error Tracked:', error)
    }
  }

  trackUserAction(action: string, data?: any) {
    this.trackMetric(`user_action_${action}`, 1)
    
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics service
      this.sendUserActionToService(action, data)
    } else {
      console.log('👤 User Action:', { action, data, userId: this.userId })
    }
  }

  trackBusinessMetric(metric: string, value: number, metadata?: any) {
    const businessMetric = {
      metric,
      value,
      metadata,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    }

    if (process.env.NODE_ENV === 'production') {
      this.sendBusinessMetricToService(businessMetric)
    } else {
      console.log('💼 Business Metric:', businessMetric)
    }
  }

  private async sendMetricToService(metric: PerformanceMetric) {
    try {
      // Replace with your analytics service endpoint
      await fetch('/api/analytics/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      })
    } catch (error) {
      console.error('Failed to send metric:', error)
    }
  }

  private async sendErrorToService(error: ErrorLog) {
    try {
      // Replace with your error reporting service endpoint
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      })
    } catch (err) {
      console.error('Failed to send error:', err)
    }
  }

  private async sendUserActionToService(action: string, data?: any) {
    try {
      await fetch('/api/analytics/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          data,
          timestamp: Date.now(),
          userId: this.userId,
          sessionId: this.sessionId
        })
      })
    } catch (error) {
      console.error('Failed to send user action:', error)
    }
  }

  private async sendBusinessMetricToService(metric: any) {
    try {
      await fetch('/api/analytics/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      })
    } catch (error) {
      console.error('Failed to send business metric:', error)
    }
  }

  getSessionMetrics() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      metrics: this.metrics,
      errors: this.errors,
      sessionDuration: Date.now() - parseInt(this.sessionId.split('_')[1])
    }
  }

  // Web Vitals tracking
  trackWebVitals() {
    if (typeof window !== 'undefined') {
      // Core Web Vitals
      import('web-vitals').then((webVitals) => {
        if (webVitals.onCLS) {
          webVitals.onCLS((metric: any) => this.trackMetric('cls', metric.value))
        }
        if (webVitals.onFID) {
          webVitals.onFID((metric: any) => this.trackMetric('fid', metric.value))
        }
        if (webVitals.onFCP) {
          webVitals.onFCP((metric: any) => this.trackMetric('fcp', metric.value))
        }
        if (webVitals.onLCP) {
          webVitals.onLCP((metric: any) => this.trackMetric('lcp', metric.value))
        }
        if (webVitals.onTTFB) {
          webVitals.onTTFB((metric: any) => this.trackMetric('ttfb', metric.value))
        }
      }).catch(() => {
        // Fallback if web-vitals is not available
        console.log('Web Vitals not available')
      })
    }
  }
}

// Singleton instance
export const monitoring = new ProductionMonitoring()

// React hook for monitoring
export const useMonitoring = () => {
  return {
    trackMetric: monitoring.trackMetric.bind(monitoring),
    trackError: monitoring.trackError.bind(monitoring),
    trackUserAction: monitoring.trackUserAction.bind(monitoring),
    trackBusinessMetric: monitoring.trackBusinessMetric.bind(monitoring),
    setUserId: monitoring.setUserId.bind(monitoring)
  }
}

export default monitoring