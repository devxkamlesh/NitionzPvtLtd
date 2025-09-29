'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../components/FirebaseProvider'
import DashboardLayout from '../../components/DashboardLayout'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Clock,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react'

interface Investment {
  id: string
  planName: string
  amount: number
  roiPercentage: number
  durationMonths: number
  status: string
  createdAt: any
  expiryAt?: any
  currentValue?: number
  profitEarned?: number
}

export default function PortfolioPage() {
  const { user } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [totalStats, setTotalStats] = useState({
    totalInvested: 0,
    currentValue: 0,
    totalProfit: 0,
    activeInvestments: 0
  })

  useEffect(() => {
    const fetchInvestments = async () => {
      if (user) {
        try {
          const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            where('status', 'in', ['paid', 'processing'])
          )
          const ordersSnapshot = await getDocs(ordersQuery)
          const investmentsData = ordersSnapshot.docs.map(doc => {
            const data = doc.data()
            
            // Calculate current value and profit
            const monthsElapsed = data.createdAt ? 
              Math.floor((Date.now() - data.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
            
            const monthlyROI = (data.roiPercentage || 12) / 12 / 100
            const currentValue = data.amount * Math.pow(1 + monthlyROI, monthsElapsed)
            const profitEarned = currentValue - data.amount

            return {
              id: doc.id,
              ...data,
              currentValue,
              profitEarned
            }
          }) as Investment[]
          
          setInvestments(investmentsData.sort((a, b) => 
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          ))

          // Calculate total stats
          const stats = investmentsData.reduce((acc, inv) => ({
            totalInvested: acc.totalInvested + inv.amount,
            currentValue: acc.currentValue + (inv.currentValue || inv.amount),
            totalProfit: acc.totalProfit + (inv.profitEarned || 0),
            activeInvestments: acc.activeInvestments + 1
          }), {
            totalInvested: 0,
            currentValue: 0,
            totalProfit: 0,
            activeInvestments: 0
          })

          setTotalStats(stats)
        } catch (error) {
          console.error('Error fetching investments:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchInvestments()
  }, [user])

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    
    let dateObj
    if (date.toDate) {
      dateObj = date.toDate()
    } else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }
    
    return dateObj.toLocaleDateString()
  }

  const getROIColor = (profit: number) => {
    return profit >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getDaysRemaining = (createdAt: any, durationMonths: number) => {
    if (!createdAt) return null
    
    const startDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + durationMonths)
    
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Investment Portfolio</h1>
          <p className="text-gray-600">Track your investment performance and returns</p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalStats.totalInvested)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalStats.currentValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className={`text-2xl font-bold ${getROIColor(totalStats.totalProfit)}`}>
                  {totalStats.totalProfit >= 0 ? '+' : ''}{formatCurrency(totalStats.totalProfit)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                {totalStats.totalProfit >= 0 ? (
                  <ArrowUpRight className="w-6 h-6 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Investments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStats.activeInvestments}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Performance Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Portfolio Performance</h2>
            <div className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-gray-400" />
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Portfolio performance chart</p>
              <p className="text-sm text-gray-400">Coming soon with advanced analytics</p>
            </div>
          </div>
        </div>

        {/* Investment List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Investments</h2>
          </div>
          
          {investments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {investments.map((investment) => {
                const daysRemaining = getDaysRemaining(investment.createdAt, investment.durationMonths)
                const progressPercentage = daysRemaining ? 
                  Math.max(0, Math.min(100, ((investment.durationMonths * 30 - daysRemaining) / (investment.durationMonths * 30)) * 100)) : 100

                return (
                  <div key={investment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{investment.planName}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Started: {formatDate(investment.createdAt)}
                          </span>
                          <span className="text-sm text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Duration: {investment.durationMonths} months
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-6">
                          <div>
                            <p className="text-sm text-gray-500">Invested</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(investment.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Current Value</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(investment.currentValue || investment.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Profit/Loss</p>
                            <p className={`text-lg font-bold ${getROIColor(investment.profitEarned || 0)}`}>
                              {(investment.profitEarned || 0) >= 0 ? '+' : ''}
                              {formatCurrency(investment.profitEarned || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ROI</p>
                            <p className="text-lg font-bold text-green-600">
                              {investment.roiPercentage || 12}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Investment Progress</span>
                        <span>
                          {daysRemaining && daysRemaining > 0 
                            ? `${daysRemaining} days remaining` 
                            : 'Matured'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-nitionz-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Investments</h3>
              <p className="text-gray-500 mb-6">Start investing to build your portfolio</p>
              <a
                href="/investment-plans"
                className="bg-nitionz-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Investment Plans
              </a>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}