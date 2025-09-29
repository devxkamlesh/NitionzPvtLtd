'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../components/FirebaseProvider'
import DashboardLayout from '../components/DashboardLayout'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  Calendar,
  ArrowUpRight,
  Activity
} from 'lucide-react'
import { useClientSideFormat } from '../lib/formatUtils'
import PortfolioChart from '../components/PortfolioChart'
import UserNotifications from '../components/UserNotifications'

interface UserData {
  name: string
  email: string
  phone: string
  createdAt: any
  kyc: {
    status: 'not_submitted' | 'pending' | 'submitted' | 'approved' | 'rejected'
    comment?: string
  }
}

interface Order {
  id: string
  amount: number
  status: string
  createdAt: any
  planName: string
}



export default function DashboardOverview() {
  const { user } = useAuth()
  const { formatCurrency, formatNumber } = useClientSideFormat()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch user data
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          let userData = null
          if (userDoc.exists()) {
            userData = userDoc.data() as UserData
          }

          // Fetch KYC data
          const kycDoc = await getDoc(doc(db, 'kyc', user.uid))
          let kycStatus = 'not_submitted'
          let kycComment = undefined
          if (kycDoc.exists()) {
            const kycData = kycDoc.data()
            kycStatus = kycData.status || 'not_submitted'
            kycComment = kycData.rejectionReason || kycData.comment
          }

          // Combine user data with KYC status
          setUserData({
            name: userData?.name || user.displayName || user.email?.split('@')[0] || 'User',
            email: userData?.email || user.email || '',
            phone: userData?.phone || '',
            createdAt: userData?.createdAt || user.metadata?.creationTime,
            kyc: {
              status: kycStatus,
              comment: kycComment
            }
          } as UserData)

          // Fetch user orders
          const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid)
          )
          const ordersSnapshot = await getDocs(ordersQuery)
          const ordersData = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Order[]
          setOrders(ordersData)



        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [user])

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    
    try {
      let dateObj: Date
      
      // Handle Firestore Timestamp
      if (date && typeof date.toDate === 'function') {
        dateObj = date.toDate()
      }
      // Handle Firestore Timestamp with seconds
      else if (date && typeof date.seconds === 'number') {
        dateObj = new Date(date.seconds * 1000)
      }
      // Handle ISO string
      else if (typeof date === 'string') {
        dateObj = new Date(date)
      }
      // Handle Date object
      else if (date instanceof Date) {
        dateObj = date
      }
      // Handle timestamp number
      else if (typeof date === 'number') {
        dateObj = new Date(date)
      }
      else {
        return 'Invalid Date'
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
      }
      
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getKYCStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Verified'
      case 'pending': return 'Under Review'
      case 'rejected': return 'Rejected'
      default: return 'Not Submitted'
    }
  }

  const activeInvestments = orders.filter(order => order.status === 'paid' || order.status === 'processing').length
  const totalInvested = orders
    .filter(order => order.status === 'paid' || order.status === 'processing')
    .reduce((sum, order) => sum + order.amount, 0)
  const pendingOrders = orders.filter(order => order.status === 'payment_uploaded').length

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nitionz-blue"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* User Notifications */}
        <UserNotifications />

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-nitionz-blue to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {userData?.name || user?.displayName}!
              </h1>
              <p className="text-blue-100">
                Here's your investment overview for today
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-blue-100 text-sm">Member since</p>
                <p className="font-semibold">{formatDate(userData?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Alert */}
        {userData?.kyc.status !== 'approved' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    KYC Verification Required
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Complete your KYC verification to start investing. 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getKYCStatusColor(userData?.kyc.status || 'not_submitted')}`}>
                      {getKYCStatusText(userData?.kyc.status || 'not_submitted')}
                    </span>
                  </p>
                  {userData?.kyc.status === 'rejected' && userData?.kyc.comment && (
                    <p className="text-sm text-red-600 mt-1">
                      Reason: {userData.kyc.comment}
                    </p>
                  )}
                </div>
              </div>
              {userData?.kyc.status !== 'submitted' && (
                <a
                  href="/dashboard/kyc"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700"
                >
                  {userData?.kyc.status === 'rejected' ? 'Resubmit KYC' : 'Complete KYC'}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Invested</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="w-14 h-14 bg-green-200 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-green-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-700 font-medium">+12.5%</span>
              <span className="text-green-600 ml-2">from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Active Plans</p>
                <p className="text-2xl font-bold text-blue-900">{activeInvestments}</p>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600 font-medium">Live Investments</span>
                  </div>
                </div>
              </div>
              <div className="w-14 h-14 bg-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-7 h-7 text-blue-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-blue-600">Currently active</span>
              </div>
              {activeInvestments > 0 && (
                <a 
                  href="/dashboard/plans" 
                  className="text-blue-700 hover:text-blue-900 font-medium flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-300"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6 border border-orange-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Expected Returns</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(Math.round(totalInvested * 0.16))}</p>
              </div>
              <div className="w-14 h-14 bg-orange-200 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-orange-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-orange-600 mr-1" />
              <span className="text-orange-700 font-medium">16% avg</span>
              <span className="text-orange-600 ml-2">annual return</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 border border-yellow-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingOrders}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-200 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-yellow-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-yellow-600">Awaiting verification</span>
            </div>
          </div>
        </div>

        {/* Investment Growth Chart */}
        <PortfolioChart 
          totalInvested={totalInvested} 
          expectedReturns={Math.round(totalInvested * 0.16)}
          orders={orders}
        />

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <a 
                href="/dashboard/plans" 
                className="text-nitionz-blue hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="p-6">
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-nitionz-blue/10 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-nitionz-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order.planName}</p>
                        <p className="text-sm text-gray-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(order.createdAt)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(order.amount)}</p>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'payment_uploaded' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'paid' ? 'Active' :
                         order.status === 'processing' ? 'Processing' :
                         order.status === 'payment_uploaded' ? 'Pending' :
                         order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
                <p className="text-gray-500 mb-6">Start your investment journey with our secure plans</p>
                <a 
                  href="/investment-plans"
                  className="inline-flex items-center bg-nitionz-blue text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  <span>Browse Plans</span>
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}