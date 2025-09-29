'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './FirebaseProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { AlertCircle, Phone, Shield, X } from 'lucide-react'

interface UserData {
  phone?: string
  name?: string
  email?: string
}

interface KYCData {
  status?: 'not_submitted' | 'pending' | 'submitted' | 'approved' | 'rejected'
}

export default function UserNotifications() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [kycData, setKycData] = useState<KYCData | null>(null)
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Fetch user data
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData)
          }

          // Fetch KYC data
          const kycDoc = await getDoc(doc(db, 'kyc', user.uid))
          if (kycDoc.exists()) {
            setKycData(kycDoc.data() as KYCData)
          } else {
            setKycData({ status: 'not_submitted' })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [user])

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => [...prev, notificationId])
  }

  if (loading || !user) return null

  const notifications = []

  // Check for missing phone number
  if (!userData?.phone && !dismissedNotifications.includes('missing-phone')) {
    notifications.push({
      id: 'missing-phone',
      type: 'warning',
      icon: Phone,
      title: 'Add Your Phone Number',
      message: 'Please add your phone number to your profile for better account security and communication.',
      action: {
        text: 'Add Phone Number',
        href: '/dashboard/settings'
      }
    })
  }

  // Check for incomplete KYC
  if (kycData?.status !== 'approved' && !dismissedNotifications.includes('incomplete-kyc')) {
    let kycMessage = 'Complete your KYC verification to start investing in our plans.'
    let kycAction = 'Complete KYC'
    
    if (kycData?.status === 'pending' || kycData?.status === 'submitted') {
      kycMessage = 'Your KYC verification is under review. You will be notified once approved.'
      kycAction = 'View KYC Status'
    } else if (kycData?.status === 'rejected') {
      kycMessage = 'Your KYC verification was rejected. Please resubmit with correct information.'
      kycAction = 'Resubmit KYC'
    }

    notifications.push({
      id: 'incomplete-kyc',
      type: kycData?.status === 'rejected' ? 'error' : 'info',
      icon: Shield,
      title: 'KYC Verification Required',
      message: kycMessage,
      action: {
        text: kycAction,
        href: '/dashboard/kyc'
      }
    })
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-4 mb-6">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border-l-4 ${
            notification.type === 'error'
              ? 'bg-red-50 border-red-400'
              : notification.type === 'warning'
              ? 'bg-yellow-50 border-yellow-400'
              : 'bg-blue-50 border-blue-400'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                notification.type === 'error'
                  ? 'bg-red-100'
                  : notification.type === 'warning'
                  ? 'bg-yellow-100'
                  : 'bg-blue-100'
              }`}>
                <notification.icon className={`w-5 h-5 ${
                  notification.type === 'error'
                    ? 'text-red-600'
                    : notification.type === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${
                  notification.type === 'error'
                    ? 'text-red-800'
                    : notification.type === 'warning'
                    ? 'text-yellow-800'
                    : 'text-blue-800'
                }`}>
                  {notification.title}
                </h3>
                <p className={`text-sm mt-1 ${
                  notification.type === 'error'
                    ? 'text-red-700'
                    : notification.type === 'warning'
                    ? 'text-yellow-700'
                    : 'text-blue-700'
                }`}>
                  {notification.message}
                </p>
                <div className="mt-3">
                  <a
                    href={notification.action.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      notification.type === 'error'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : notification.type === 'warning'
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {notification.action.text}
                  </a>
                </div>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className={`p-1 rounded-lg transition-colors ${
                notification.type === 'error'
                  ? 'text-red-400 hover:text-red-600 hover:bg-red-100'
                  : notification.type === 'warning'
                  ? 'text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100'
                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}