'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../components/FirebaseProvider'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: any
  userId: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[]
      setNotifications(notifs)
    })

    return unsubscribe
  }, [user])

  // Only count notifications from the last 1 day as "new" for badge
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  
  const unreadCount = notifications.filter(n => {
    if (n.read) return false
    
    // Check if notification is from the last 1 day
    let notificationDate
    if (n.createdAt?.toDate) {
      notificationDate = n.createdAt.toDate()
    } else if (n.createdAt?.seconds) {
      notificationDate = new Date(n.createdAt.seconds * 1000)
    } else {
      notificationDate = new Date(n.createdAt)
    }
    
    return notificationDate > oneDayAgo
  }).length

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      await Promise.all(
        unreadNotifications.map(n => 
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        )
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}