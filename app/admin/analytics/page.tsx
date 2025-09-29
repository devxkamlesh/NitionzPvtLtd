'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../lib/firebase'
import DashboardLayout from '../../components/DashboardLayout'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalInvestments: number
  totalRevenue: number
  activeInvestments: number
  pendingOrders: number
  completedOrders: number
  rejectedOrders: number
  kycApproved: number
  kycPending: number
  kycRejected: number
  monthlyGrowth: number[]
  planDistribution: { [key: string]: number }
  userGrowth: { daily: number[], monthly: number[], yearly: number[] }
}

export default function AdminAnalyticsPage() {
  const [user] = useAuthState(auth)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [userGrowthPeriod, setUserGrowthPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily')

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      fetchAnalytics()
    } else if (user) {
      setLoading(false)
    }
  }, [user, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch all collections
      const [usersSnapshot, ordersSnapshot, kycSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'kyc'))
      ])

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const kycs = kycSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Calculate analytics
      const totalUsers = users.length
      const totalInvestments = orders.length
      const totalRevenue = orders
        .filter((order: any) => order.status === 'paid' || order.status === 'processing')
        .reduce((sum: number, order: any) => sum + (order.amount || 0), 0)

      const activeInvestments = orders.filter((order: any) => 
        order.status === 'paid' || order.status === 'processing'
      ).length

      const pendingOrders = orders.filter((order: any) => order.status === 'payment_uploaded').length
      const completedOrders = orders.filter((order: any) => order.status === 'paid').length
      const rejectedOrders = orders.filter((order: any) => order.status === 'payment_rejected').length

      const kycApproved = kycs.filter((kyc: any) => kyc.status === 'approved').length
      const kycPending = kycs.filter((kyc: any) => kyc.status === 'pending' || kyc.status === 'submitted').length
      const kycRejected = kycs.filter((kyc: any) => kyc.status === 'rejected').length

      // Plan distribution
      const planDistribution: { [key: string]: number } = {}
      orders.forEach((order: any) => {
        if (order.planName) {
          planDistribution[order.planName] = (planDistribution[order.planName] || 0) + 1
        }
      })

      // Calculate real monthly revenue growth from orders
      const monthlyGrowth = calculateMonthlyRevenue(orders)

      // Calculate real user growth data from database
      const userGrowth = calculateUserGrowth(users)

      setAnalytics({
        totalUsers,
        totalInvestments,
        totalRevenue,
        activeInvestments,
        pendingOrders,
        completedOrders,
        rejectedOrders,
        kycApproved,
        kycPending,
        kycRejected,
        monthlyGrowth,
        planDistribution,
        userGrowth
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    
    try {
      let dateObj: Date
      if (date && typeof date.toDate === 'function') {
        dateObj = date.toDate()
      } else if (date && typeof date.seconds === 'number') {
        dateObj = new Date(date.seconds * 1000)
      } else {
        dateObj = new Date(date)
      }
      
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const calculateMonthlyRevenue = (orders: any[]) => {
    const now = new Date()
    const monthlyRevenue: number[] = []

    // Calculate revenue for last 12 months
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const revenueInMonth = orders
        .filter((order: any) => {
          const orderDate = getUserDate(order.createdAt)
          return orderDate >= targetDate && orderDate < nextMonth && 
                 (order.status === 'paid' || order.status === 'processing')
        })
        .reduce((sum: number, order: any) => sum + (order.amount || 0), 0)
      
      // Convert to thousands for better chart display
      monthlyRevenue.push(Math.round(revenueInMonth / 1000))
    }

    return monthlyRevenue
  }

  const calculateUserGrowth = (users: any[]) => {
    const now = new Date()
    const daily: number[] = []
    const monthly: number[] = []
    const yearly: number[] = []

    // Calculate daily growth for last 30 days
    for (let i = 29; i >= 0; i--) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() - i)
      targetDate.setHours(0, 0, 0, 0)
      
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      const usersOnDay = users.filter(user => {
        const userDate = getUserDate(user.createdAt || user.joinedAt)
        return userDate >= targetDate && userDate < nextDay
      }).length
      
      daily.push(usersOnDay)
    }

    // Calculate monthly growth for last 12 months
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const usersInMonth = users.filter(user => {
        const userDate = getUserDate(user.createdAt || user.joinedAt)
        return userDate >= targetDate && userDate < nextMonth
      }).length
      
      monthly.push(usersInMonth)
    }

    // Calculate yearly growth for last 5 years
    for (let i = 4; i >= 0; i--) {
      const targetYear = now.getFullYear() - i
      const yearStart = new Date(targetYear, 0, 1)
      const yearEnd = new Date(targetYear + 1, 0, 1)
      
      const usersInYear = users.filter(user => {
        const userDate = getUserDate(user.createdAt || user.joinedAt)
        return userDate >= yearStart && userDate < yearEnd
      }).length
      
      yearly.push(usersInYear)
    }

    return { daily, monthly, yearly }
  }

  const getUserDate = (dateField: any): Date => {
    if (!dateField) return new Date(0)
    
    try {
      if (dateField && typeof dateField.toDate === 'function') {
        return dateField.toDate()
      } else if (dateField && typeof dateField.seconds === 'number') {
        return new Date(dateField.seconds * 1000)
      } else if (typeof dateField === 'string') {
        return new Date(dateField)
      } else if (dateField instanceof Date) {
        return dateField
      } else if (typeof dateField === 'number') {
        return new Date(dateField)
      }
    } catch (error) {
      console.error('Error parsing date:', error)
    }
    
    return new Date(0)
  }

  if (!user || user?.email !== 'admin@nitionzpvtltd.com') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nitionz-blue"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into your business performance</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex space-x-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-nitionz-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(analytics?.totalRevenue || 0)}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+12.5%</span>
                  <span className="text-blue-600 ml-2">vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-blue-200 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Investments</p>
                <p className="text-2xl font-bold text-green-900">{analytics?.activeInvestments || 0}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+8.2%</span>
                  <span className="text-green-600 ml-2">growth rate</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-green-200 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Users</p>
                <p className="text-2xl font-bold text-purple-900">{analytics?.totalUsers || 0}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+15.3%</span>
                  <span className="text-purple-600 ml-2">new signups</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-purple-200 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-900">{analytics?.pendingOrders || 0}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-orange-600">Awaiting review</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-orange-200 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Growth Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Growth</h3>
                <p className="text-sm text-gray-500">Monthly revenue trend over the last 12 months</p>
              </div>
              <BarChart3 className="w-6 h-6 text-nitionz-blue" />
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics?.monthlyGrowth.map((value, index) => {
                const now = new Date()
                const monthDate = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1)
                const maxValue = Math.max(...(analytics?.monthlyGrowth || [1]))
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div 
                      className="w-full bg-gradient-to-t from-nitionz-blue to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer relative"
                      style={{ 
                        height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                        minHeight: value > 0 ? '8px' : '2px'
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ₹{(value * 1000).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">
                      {monthDate.toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Chart Summary */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>Revenue in thousands (₹K)</span>
              <span className="font-medium">
                Total: ₹{((analytics?.monthlyGrowth.reduce((sum, val) => sum + val, 0) || 0) * 1000).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Investment Plans Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Plan Distribution</h3>
                <p className="text-sm text-gray-500">Popular investment plans breakdown</p>
              </div>
              <PieChart className="w-6 h-6 text-nitionz-blue" />
            </div>
            
            <div className="space-y-4">
              {Object.entries(analytics?.planDistribution || {}).map(([plan, count], index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-yellow-500']
                const percentage = ((count / (analytics?.totalInvestments || 1)) * 100).toFixed(1)
                
                return (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                      <span className="text-sm font-medium text-gray-700">{plan}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{count} orders</span>
                      <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* KYC Status and Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KYC Status Overview */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">KYC Status Overview</h3>
                <p className="text-sm text-gray-500">User verification status breakdown</p>
              </div>
              <CheckCircle className="w-6 h-6 text-nitionz-blue" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">{analytics?.kycApproved || 0}</p>
                <p className="text-sm text-green-700">Approved</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-900">{analytics?.kycPending || 0}</p>
                <p className="text-sm text-yellow-700">Pending</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-900">{analytics?.kycRejected || 0}</p>
                <p className="text-sm text-red-700">Rejected</p>
              </div>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Status Breakdown</h3>
                <p className="text-sm text-gray-500">Investment order processing status</p>
              </div>
              <Activity className="w-6 h-6 text-nitionz-blue" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Completed Orders</span>
                </div>
                <span className="text-lg font-bold text-green-900">{analytics?.completedOrders || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Pending Orders</span>
                </div>
                <span className="text-lg font-bold text-yellow-900">{analytics?.pendingOrders || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Rejected Orders</span>
                </div>
                <span className="text-lg font-bold text-red-900">{analytics?.rejectedOrders || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Growth Curve Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Growth Trends</h3>
              <p className="text-sm text-gray-500">Daily, monthly, and yearly user registration patterns</p>
            </div>
            <div className="flex space-x-2">
              {(['daily', 'monthly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setUserGrowthPeriod(period)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    userGrowthPeriod === period
                      ? 'bg-nitionz-blue text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 relative">
            {analytics?.userGrowth ? (
              <svg className="w-full h-full" viewBox="0 0 800 200">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                
                {/* Data points and curve */}
                {(() => {
                  const data = analytics.userGrowth[userGrowthPeriod] || []
                  const maxValue = Math.max(...data, 1) // Prevent division by zero
                  const displayData = data.slice(-8) // Show last 8 data points
                  
                  const points = displayData.map((value, index) => ({
                    x: 50 + (index * 100),
                    y: 150 - ((value / maxValue) * 100),
                    users: value,
                    index
                  }))
                  
                  // Create curve path
                  const pathData = points.length > 1 ? 
                    `M ${points[0].x} ${points[0].y} ` + 
                    points.slice(1).map((point, i) => {
                      const prevPoint = points[i]
                      const cpx1 = prevPoint.x + (point.x - prevPoint.x) / 3
                      const cpy1 = prevPoint.y
                      const cpx2 = point.x - (point.x - prevPoint.x) / 3
                      const cpy2 = point.y
                      return `C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${point.x} ${point.y}`
                    }).join(' ')
                    : ''
                  
                  return (
                    <>
                      {/* Curve path */}
                      {pathData && (
                        <path
                          d={pathData}
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="3"
                          className="drop-shadow-sm"
                        />
                      )}
                      
                      {/* Data points */}
                      {points.map((point, index) => (
                        <g key={index}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill="#3b82f6"
                            className="hover:r-8 transition-all cursor-pointer"
                          />
                          <text
                            x={point.x}
                            y={point.y - 15}
                            textAnchor="middle"
                            className="text-xs fill-gray-600 font-medium"
                          >
                            {point.users}
                          </text>
                          {/* X-axis labels */}
                          <text
                            x={point.x}
                            y={180}
                            textAnchor="middle"
                            className="text-xs fill-gray-500"
                          >
                            {userGrowthPeriod === 'daily' ? `D${index + 1}` :
                             userGrowthPeriod === 'monthly' ? `M${index + 1}` :
                             `Y${index + 1}`}
                          </text>
                        </g>
                      ))}
                    </>
                  )
                })()}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nitionz-blue"></div>
              </div>
            )}
          </div>
          
          {/* Chart Summary */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>
              {userGrowthPeriod === 'daily' ? 'Last 30 days' :
               userGrowthPeriod === 'monthly' ? 'Last 12 months' :
               'Last 5 years'}
            </span>
            <span className="font-medium">
              Total: {analytics?.userGrowth[userGrowthPeriod]?.reduce((sum, val) => sum + val, 0) || 0} users
            </span>
          </div>
        </div>


      </div>
    </DashboardLayout>
  )
}