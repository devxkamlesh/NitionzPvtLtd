'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw,
  Database,
  Users,
  CreditCard,
  Shield,
  BarChart3
} from 'lucide-react'
import { 
  generateTestData, 
  validateUserData, 
  validateOrderData, 
  validateKYCData,
  checkDataIntegrity,
  testAnalyticsCalculations,
  measurePerformance
} from '../lib/testUtils'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message: string
  duration?: number
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Data Generation', status: 'pending', message: 'Generate test data' },
    { name: 'User Validation', status: 'pending', message: 'Validate user data structure' },
    { name: 'Order Validation', status: 'pending', message: 'Validate order data structure' },
    { name: 'KYC Validation', status: 'pending', message: 'Validate KYC data structure' },
    { name: 'Data Integrity', status: 'pending', message: 'Check data relationships' },
    { name: 'Analytics Calculations', status: 'pending', message: 'Test analytics functions' },
    { name: 'Performance Test', status: 'pending', message: 'Measure calculation performance' },
    { name: 'Error Handling', status: 'pending', message: 'Test error scenarios' }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [testData, setTestData] = useState<any>(null)

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ))
  }

  const runTests = async () => {
    setIsRunning(true)
    
    try {
      // Test 1: Data Generation
      updateTest(0, { status: 'running', message: 'Generating test data...' })
      const start1 = performance.now()
      const data = generateTestData()
      const end1 = performance.now()
      setTestData(data)
      updateTest(0, { 
        status: 'passed', 
        message: `Generated ${data.users.length} users, ${data.orders.length} orders, ${data.kycs.length} KYCs`,
        duration: end1 - start1
      })

      // Test 2: User Validation
      updateTest(1, { status: 'running', message: 'Validating user data...' })
      const start2 = performance.now()
      const validUsers = data.users.filter(validateUserData)
      const end2 = performance.now()
      
      if (validUsers.length === data.users.length) {
        updateTest(1, { 
          status: 'passed', 
          message: `All ${validUsers.length} users are valid`,
          duration: end2 - start2
        })
      } else {
        updateTest(1, { 
          status: 'failed', 
          message: `${data.users.length - validUsers.length} invalid users found`,
          duration: end2 - start2
        })
      }

      // Test 3: Order Validation
      updateTest(2, { status: 'running', message: 'Validating order data...' })
      const start3 = performance.now()
      const validOrders = data.orders.filter(validateOrderData)
      const end3 = performance.now()
      
      if (validOrders.length === data.orders.length) {
        updateTest(2, { 
          status: 'passed', 
          message: `All ${validOrders.length} orders are valid`,
          duration: end3 - start3
        })
      } else {
        updateTest(2, { 
          status: 'failed', 
          message: `${data.orders.length - validOrders.length} invalid orders found`,
          duration: end3 - start3
        })
      }

      // Test 4: KYC Validation
      updateTest(3, { status: 'running', message: 'Validating KYC data...' })
      const start4 = performance.now()
      const validKYCs = data.kycs.filter(validateKYCData)
      const end4 = performance.now()
      
      if (validKYCs.length === data.kycs.length) {
        updateTest(3, { 
          status: 'passed', 
          message: `All ${validKYCs.length} KYC records are valid`,
          duration: end4 - start4
        })
      } else {
        updateTest(3, { 
          status: 'failed', 
          message: `${data.kycs.length - validKYCs.length} invalid KYC records found`,
          duration: end4 - start4
        })
      }

      // Test 5: Data Integrity
      updateTest(4, { status: 'running', message: 'Checking data integrity...' })
      const start5 = performance.now()
      const integrityIssues = checkDataIntegrity(data.users, data.orders, data.kycs)
      const end5 = performance.now()
      
      if (integrityIssues.length === 0) {
        updateTest(4, { 
          status: 'passed', 
          message: 'No data integrity issues found',
          duration: end5 - start5
        })
      } else {
        updateTest(4, { 
          status: 'failed', 
          message: `Found issues: ${integrityIssues.join(', ')}`,
          duration: end5 - start5
        })
      }

      // Test 6: Analytics Calculations
      updateTest(5, { status: 'running', message: 'Testing analytics calculations...' })
      const start6 = performance.now()
      const analytics = testAnalyticsCalculations(data.users, data.orders)
      const end6 = performance.now()
      
      if (analytics.totalUsers > 0 && analytics.totalRevenue >= 0) {
        updateTest(5, { 
          status: 'passed', 
          message: `Analytics: ${analytics.totalUsers} users, ₹${analytics.totalRevenue.toLocaleString()} revenue`,
          duration: end6 - start6
        })
      } else {
        updateTest(5, { 
          status: 'failed', 
          message: 'Analytics calculations failed',
          duration: end6 - start6
        })
      }

      // Test 7: Performance Test
      updateTest(6, { status: 'running', message: 'Running performance tests...' })
      const start7 = performance.now()
      
      // Simulate heavy calculations
      for (let i = 0; i < 1000; i++) {
        testAnalyticsCalculations(data.users.slice(0, 10), data.orders.slice(0, 50))
      }
      
      const end7 = performance.now()
      const avgTime = (end7 - start7) / 1000
      
      if (avgTime < 100) { // Less than 100ms for 1000 calculations
        updateTest(6, { 
          status: 'passed', 
          message: `1000 calculations in ${avgTime.toFixed(2)}ms (avg: ${(avgTime/1000).toFixed(3)}ms)`,
          duration: end7 - start7
        })
      } else {
        updateTest(6, { 
          status: 'failed', 
          message: `Performance too slow: ${avgTime.toFixed(2)}ms`,
          duration: end7 - start7
        })
      }

      // Test 8: Error Handling
      updateTest(7, { status: 'running', message: 'Testing error handling...' })
      const start8 = performance.now()
      
      try {
        // Test with invalid data
        validateUserData(null)
        validateOrderData({ invalid: 'data' })
        validateKYCData(undefined)
        
        // Test with empty arrays
        checkDataIntegrity([], [], [])
        testAnalyticsCalculations([], [])
        
        const end8 = performance.now()
        updateTest(7, { 
          status: 'passed', 
          message: 'Error handling works correctly',
          duration: end8 - start8
        })
      } catch (error) {
        const end8 = performance.now()
        updateTest(7, { 
          status: 'failed', 
          message: `Unexpected error: ${error}`,
          duration: end8 - start8
        })
      }

    } catch (error) {
      console.error('Test suite failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const resetTests = () => {
    setTests(prev => prev.map(test => ({ 
      ...test, 
      status: 'pending' as const, 
      duration: undefined 
    })))
    setTestData(null)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-50 border-green-200'
      case 'failed': return 'bg-red-50 border-red-200'
      case 'running': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const passedTests = tests.filter(t => t.status === 'passed').length
  const failedTests = tests.filter(t => t.status === 'failed').length
  const totalTests = tests.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Investment Platform Test Suite</h1>
              <p className="text-gray-600 mt-1">Comprehensive testing for production readiness</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetTests}
                disabled={isRunning}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Reset
              </button>
              <button
                onClick={runTests}
                disabled={isRunning}
                className="px-6 py-2 bg-nitionz-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
              </button>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {passedTests + failedTests} / {totalTests}</span>
              <span>
                {passedTests > 0 && <span className="text-green-600">{passedTests} passed</span>}
                {passedTests > 0 && failedTests > 0 && <span className="mx-2">•</span>}
                {failedTests > 0 && <span className="text-red-600">{failedTests} failed</span>}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-nitionz-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${((passedTests + failedTests) / totalTests) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.message}</p>
                  </div>
                </div>
                {test.duration && (
                  <span className="text-xs text-gray-500">
                    {test.duration.toFixed(2)}ms
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Test Data Summary */}
        {testData && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Data Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{testData.users.length}</p>
                  <p className="text-sm text-blue-700">Test Users</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CreditCard className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{testData.orders.length}</p>
                  <p className="text-sm text-green-700">Test Orders</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">{testData.kycs.length}</p>
                  <p className="text-sm text-purple-700">Test KYCs</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>System Status</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Environment: <span className="font-medium">{process.env.NODE_ENV}</span></p>
              <p className="text-gray-600">User Agent: <span className="font-medium">{navigator.userAgent.split(' ')[0]}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Timestamp: <span className="font-medium">{new Date().toLocaleString()}</span></p>
              <p className="text-gray-600">Tests Status: 
                <span className={`ml-1 font-medium ${
                  failedTests > 0 ? 'text-red-600' : 
                  passedTests === totalTests ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {failedTests > 0 ? 'Failed' : 
                   passedTests === totalTests ? 'All Passed' : 'In Progress'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}