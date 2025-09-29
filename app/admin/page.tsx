'use client'

import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import DashboardLayout from '../components/DashboardLayout'
import { 
  Users, 
  CreditCard, 
  Shield, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react'

interface AdminStats {
  overview: {
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    activeInvestments: number
  }
  kycStats: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  supportStats: {
    total: number
    open: number
    inProgress: number
    resolved: number
    closed: number
  }
  monthlyRevenue: Array<{
    month: string
    revenue: number
    orders: number
  }>
  recentOrders: Array<{
    id: string
    userName: string
    planName: string
    amount: number
    status: string
    createdAt: any
  }>
}

export default function AdminDashboard() {
  const [user] = useAuthState(auth)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      fetchAdminStats()
    } else if (user) {
      // User is logged in but not admin, stop loading
      setLoading(false)
    }
  }, [user])

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'payment_uploaded': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user || user?.email !== 'admin@nitionzpvtltd.com') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Admin Access:</strong> Please contact the system administrator or use the admin email account to access this panel.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nitionz-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-nitionz-blue to-blue-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-blue-100">
                Manage your investment platform and monitor performance
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.overview.totalRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Investments</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.activeInvestments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.pendingOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            href="/admin/kyc"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">KYC Management</h3>
                <p className="text-sm text-gray-600">{stats?.kycStats.pending || 0} pending reviews</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/orders"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Orders & Payments</h3>
                <p className="text-sm text-gray-600">{stats?.overview.pendingOrders || 0} pending payments</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/queries"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">User Queries</h3>
                <p className="text-sm text-gray-600">{stats?.supportStats.open || 0} open queries</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/users"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">{stats?.overview.totalUsers || 0} total users</p>
              </div>
            </div>
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* KYC Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">KYC Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Pending Review</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.kycStats.pending || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Approved</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.kycStats.approved || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Rejected</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.kycStats.rejected || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Support Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Open</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.supportStats.open || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.supportStats.inProgress || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Resolved</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.supportStats.resolved || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
            </div>
            <div className="p-6">
              {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                <div className="space-y-4">
                  {stats.monthlyRevenue.slice(-6).map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-nitionz-blue/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-nitionz-blue">{data.month.split(' ')[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(data.revenue)}</p>
                          <p className="text-xs text-gray-500">{data.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No revenue data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <a href="/admin/orders" className="text-sm text-nitionz-blue hover:text-blue-700">
                View All
              </a>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.userName || 'Unknown User'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.planName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No recent orders</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}