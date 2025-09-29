'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Bell } from 'lucide-react'

interface NotificationCounts {
  pendingOrders: number
  newQueries: number
  unreviewedUsers: number
  newKyc: number
  total: number
}

export default function AdminNotificationBadge() {
  const [counts, setCounts] = useState<NotificationCounts>({
    pendingOrders: 0,
    newQueries: 0,
    unreviewedUsers: 0,
    newKyc: 0,
    total: 0
  })

  useEffect(() => {
    // Listen to pending orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'payment_uploaded')
    )

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const pendingCount = snapshot.size
      setCounts(prev => ({
        ...prev,
        pendingOrders: pendingCount,
        total: prev.newQueries + prev.unreviewedUsers + prev.newKyc + pendingCount
      }))
    })

    // Listen to new queries (unread)
    const queriesQuery = query(
      collection(db, 'queries'),
      where('status', '==', 'open')
    )

    const unsubscribeQueries = onSnapshot(queriesQuery, (snapshot) => {
      const queriesCount = snapshot.size
      setCounts(prev => ({
        ...prev,
        newQueries: queriesCount,
        total: prev.pendingOrders + prev.unreviewedUsers + prev.newKyc + queriesCount
      }))
    })

    // Listen to unreviewed users (users where adminReviewed is false or doesn't exist)
    const unreviewedUsersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(100)
    )

    const unsubscribeUnreviewedUsers = onSnapshot(unreviewedUsersQuery, (snapshot) => {
      const unreviewedUsers = snapshot.docs.filter(doc => {
        const data = doc.data()
        return !data.adminReviewed // Only count users where adminReviewed is false or undefined
      })
      const unreviewedCount = unreviewedUsers.length
      setCounts(prev => ({
        ...prev,
        unreviewedUsers: unreviewedCount,
        total: prev.pendingOrders + prev.newQueries + prev.newKyc + unreviewedCount
      }))
    })

    // Listen to new KYC submissions (pending status)
    const kycQuery = query(
      collection(db, 'kyc'),
      where('status', '==', 'pending')
    )

    const unsubscribeKyc = onSnapshot(kycQuery, (snapshot) => {
      const kycCount = snapshot.size
      setCounts(prev => ({
        ...prev,
        newKyc: kycCount,
        total: prev.pendingOrders + prev.newQueries + prev.unreviewedUsers + kycCount
      }))
    })

    return () => {
      unsubscribeOrders()
      unsubscribeQueries()
      unsubscribeUnreviewedUsers()
      unsubscribeKyc()
    }
  }, [])

  if (counts.total === 0) {
    return (
      <div className="relative">
        <Bell className="w-6 h-6 text-gray-600" />
      </div>
    )
  }

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-600" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
        {counts.total > 99 ? '99+' : counts.total}
      </span>
    </div>
  )
}

export function AdminNotificationDropdown() {
  const [counts, setCounts] = useState<NotificationCounts>({
    pendingOrders: 0,
    newQueries: 0,
    unreviewedUsers: 0,
    newKyc: 0,
    total: 0
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Same listeners as above but with enhanced user tracking
    const ordersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'payment_uploaded')
    )

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const pendingCount = snapshot.size
      setCounts(prev => ({
        ...prev,
        pendingOrders: pendingCount,
        total: prev.newQueries + prev.unreviewedUsers + prev.newKyc + pendingCount
      }))
    })

    const queriesQuery = query(
      collection(db, 'queries'),
      where('status', '==', 'open')
    )

    const unsubscribeQueries = onSnapshot(queriesQuery, (snapshot) => {
      const queriesCount = snapshot.size
      setCounts(prev => ({
        ...prev,
        newQueries: queriesCount,
        total: prev.pendingOrders + prev.unreviewedUsers + prev.newKyc + queriesCount
      }))
    })

    // Listen to unreviewed users
    const unreviewedUsersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(100)
    )

    const unsubscribeUnreviewedUsers = onSnapshot(unreviewedUsersQuery, (snapshot) => {
      const unreviewedUsers = snapshot.docs.filter(doc => {
        const data = doc.data()
        return !data.adminReviewed // Only count users where adminReviewed is false or undefined
      })
      const unreviewedCount = unreviewedUsers.length
      setCounts(prev => ({
        ...prev,
        unreviewedUsers: unreviewedCount,
        total: prev.pendingOrders + prev.newQueries + prev.newKyc + unreviewedCount
      }))
    })

    // Listen to new KYC submissions
    const kycQuery = query(
      collection(db, 'kyc'),
      where('status', '==', 'pending')
    )

    const unsubscribeKyc = onSnapshot(kycQuery, (snapshot) => {
      const kycCount = snapshot.size
      setCounts(prev => ({
        ...prev,
        newKyc: kycCount,
        total: prev.pendingOrders + prev.newQueries + prev.unreviewedUsers + kycCount
      }))
    })

    return () => {
      unsubscribeOrders()
      unsubscribeQueries()
      unsubscribeUnreviewedUsers()
      unsubscribeKyc()
    }
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {counts.total > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {counts.total > 99 ? '99+' : counts.total}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="p-4 space-y-3">
            {counts.unreviewedUsers > 0 && (
              <a
                href="/admin/users?filter=unreviewed"
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div>
                  <p className="font-medium text-gray-900">Users Need Review</p>
                  <p className="text-sm text-gray-600">New users waiting for admin review</p>
                </div>
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                  {counts.unreviewedUsers}
                </span>
              </a>
            )}

            {counts.pendingOrders > 0 && (
              <a
                href="/admin/orders"
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div>
                  <p className="font-medium text-gray-900">Pending Orders</p>
                  <p className="text-sm text-gray-600">Orders waiting for payment confirmation</p>
                </div>
                <span className="bg-yellow-500 text-white text-sm px-2 py-1 rounded-full">
                  {counts.pendingOrders}
                </span>
              </a>
            )}

            {counts.newQueries > 0 && (
              <a
                href="/admin/queries"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div>
                  <p className="font-medium text-gray-900">New Queries</p>
                  <p className="text-sm text-gray-600">Unread customer queries</p>
                </div>
                <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  {counts.newQueries}
                </span>
              </a>
            )}

            {counts.newKyc > 0 && (
              <a
                href="/admin/kyc"
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div>
                  <p className="font-medium text-gray-900">New KYC</p>
                  <p className="text-sm text-gray-600">KYC documents pending review</p>
                </div>
                <span className="bg-green-500 text-white text-sm px-2 py-1 rounded-full">
                  {counts.newKyc}
                </span>
              </a>
            )}

            <a
              href="/admin/analytics"
              className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div>
                <p className="font-medium text-gray-900">Portfolio Performance Chart</p>
                <p className="text-sm text-gray-600">Coming soon with advanced analytics</p>
              </div>
              <span className="bg-purple-500 text-white text-sm px-2 py-1 rounded-full">
                New
              </span>
            </a>

            {counts.total === 0 && (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}