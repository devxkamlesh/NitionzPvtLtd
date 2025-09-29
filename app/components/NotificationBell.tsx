'use client'

import { useState } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const formatDate = (date: any) => {
    if (!date) return ''
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Mark all read</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-sm text-gray-400">You'll see updates here when they arrive</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 text-center">
                <a 
                  href="/dashboard/my-queries"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View My Queries
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}