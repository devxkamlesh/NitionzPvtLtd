'use client'

import { useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface NotificationProps {
  type: 'success' | 'error'
  message: string
  onClose: () => void
  duration?: number
}

export default function Notification({ type, message, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
        type === 'success' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        <div className="flex items-center space-x-3">
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm flex-1">{message}</span>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}