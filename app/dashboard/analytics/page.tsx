'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../components/FirebaseProvider'
import DashboardLayout from '../../components/DashboardLayout'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Calendar, 
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react'

interface Order {
  id: string
  amount: number
  status: string
  createdAt: any
  planName: string
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
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
          console.error('Error fetching orders:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchOrders()
  }, [user])

  // Calculate analytics data
  const totalInvested = orders
    .filter(order => order.status === 'paid' || order.status === 'processing')
    .reduce((sum, order) => sum + order.amount, 0)

  const expectedReturns = totalInvested * 0.16 // 16% average return
  const monthlyReturn = expectedReturns / 12

  const activeInvestments = orders.filter(order => order.status === 'paid' || order.status === 'processing').length
  const pendingOrders = orders.filter(order => order.status === 'payment_uploaded').length

  // Calculate monthly data based on actual orders
  const monthlyData = orders.reduce((acc, order) => {
    if (order.status === 'paid' || order.status === 'processing') {
      const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, invested: 0, returns: 0 }
      }
      
      acc[monthKey].invested += order.amount
      acc[monthKey].returns += Math.round(order.amount * 0.16) // 16% return
    }
    return acc
  }, {} as Record<string, { month: string, invested: number, returns: number }>)

  const monthlyDataArray = Object.values(monthlyData).slice(-6) // Last 6 months

  // Plan distribution
  const planDistribution = orders.reduce((acc, order) => {
    if (order.status === 'paid' || order.status === 'processing') {
      acc[order.planName] = (acc[order.planName] || 0) + order.amount
    }
    return acc
  }, {} as Record<string, number>)

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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Analytics</h1>
          <p className="text-gray-600">Track your investment performance and growth</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{(totalInvested + expectedReturns).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+16.0%</span>
              <span className="text-gray-500 ml-2">annual growth</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">₹{expectedReturns.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 font-medium">₹{monthlyReturn.toLocaleString()}</span>
              <span className="text-gray-500 ml-2">monthly avg</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">{activeInvestments}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">{pendingOrders} pending verification</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI Performance</p>
                <p className="text-2xl font-bold text-gray-900">16.0%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">Above target</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Investment Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Investment Growth</h2>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {monthlyDataArray.length > 0 ? (
                <div className="space-y-4">
                  {monthlyDataArray.map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-nitionz-blue/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-nitionz-blue">{data.month.split(' ')[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">₹{data.invested.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Invested</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">+₹{data.returns.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Returns</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No investment data yet</p>
                  <p className="text-sm text-gray-400">Start investing to see your growth chart</p>
                </div>
              )}
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Plan Distribution</h2>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {Object.keys(planDistribution).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(planDistribution).map(([planName, amount], index) => {
                    const percentage = (amount / totalInvested) * 100
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500']
                    
                    return (
                      <div key={planName} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="text-sm font-medium text-gray-900">{planName}</span>
                          </div>
                          <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colors[index % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">₹{amount.toLocaleString()}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active investments</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Performance Insights</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Investment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Invested</span>
                    <span className="font-medium">₹{totalInvested.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Returns</span>
                    <span className="font-medium text-green-600">₹{expectedReturns.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Portfolio Value</span>
                    <span className="font-medium">₹{(totalInvested + expectedReturns).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Net Gain</span>
                    <span className="font-medium text-green-600">+{((expectedReturns / totalInvested) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Key Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800">Average Return Rate</span>
                    </div>
                    <span className="font-medium text-green-800">16.0%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">Investment Period</span>
                    </div>
                    <span className="font-medium text-blue-800">12 months</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-800">Risk Level</span>
                    </div>
                    <span className="font-medium text-orange-800">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}