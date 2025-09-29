'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h1>
      
      <p className="text-gray-600 mb-6">
        We're sorry, but something unexpected happened. Please try again.
      </p>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 mb-2">
            Error Details (Development)
          </summary>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      
      <div className="flex space-x-3">
        <button
          onClick={resetError}
          className="flex-1 bg-nitionz-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
)

export default ErrorBoundary