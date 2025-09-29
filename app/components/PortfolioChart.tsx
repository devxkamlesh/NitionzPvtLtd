'use client'

import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react'

interface PortfolioChartProps {
  totalInvested: number
  expectedReturns: number
  orders: any[]
}

export default function PortfolioChart({ totalInvested, expectedReturns, orders }: PortfolioChartProps) {
  // Use the props to make the chart more dynamic
  const portfolioGrowth = totalInvested > 0 ? ((expectedReturns / totalInvested) * 100).toFixed(1) : '0.0'
  
  // Calculate real investment growth data from orders
  const calculateInvestmentGrowth = () => {
    const now = new Date()
    const monthlyData = []

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthlyInvestment = orders
        .filter((order: any) => {
          const orderDate = getOrderDate(order.createdAt)
          return orderDate >= targetDate && orderDate < nextMonth && 
                 (order.status === 'paid' || order.status === 'processing')
        })
        .reduce((sum: number, order: any) => sum + (order.amount || 0), 0)
      
      monthlyData.push({
        month: targetDate.toLocaleDateString('en-IN', { month: 'short' }),
        value: Math.round(monthlyInvestment / 1000) // Convert to thousands
      })
    }

    return monthlyData
  }

  const getOrderDate = (dateField: any): Date => {
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
      }
    } catch (error) {
      console.error('Error parsing date:', error)
    }
    
    return new Date(0)
  }

  const chartData = calculateInvestmentGrowth()
  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Investment Growth Trend</h2>
              <p className="text-sm text-gray-500">Monthly investment amounts over the last 12 months</p>
            </div>
          </div>
          <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-semibold">
            Coming Soon
          </span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Chart Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Portfolio Growth</p>
                <p className="text-2xl font-bold text-green-900">+{portfolioGrowth}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Monthly Return</p>
                <p className="text-2xl font-bold text-blue-900">+2.1%</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Risk Score</p>
                <p className="text-2xl font-bold text-purple-900">Low</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Mock Chart Visualization */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Investment Growth Trend</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                <span className="text-gray-600">Portfolio Value</span>
              </div>
            </div>
          </div>
          
          {/* Investment Growth Bar Chart */}
          <div className="flex items-end justify-between space-x-2 h-48 mb-4">
            {chartData.map((data) => (
              <div key={data.month} className="flex flex-col items-center flex-1 group">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-blue-600 cursor-pointer relative"
                  style={{ 
                    height: `${maxValue > 0 ? (data.value / maxValue) * 100 : 0}%`,
                    minHeight: data.value > 0 ? '8px' : '2px'
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{(data.value * 1000).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
          
          {/* Chart Footer */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Investment amounts in thousands (₹K)</span>
            <span className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">
                Total: ₹{(chartData.reduce((sum, d) => sum + d.value, 0) * 1000).toLocaleString('en-IN')}
              </span>
            </span>
          </div>
        </div>


      </div>
    </div>
  )
}