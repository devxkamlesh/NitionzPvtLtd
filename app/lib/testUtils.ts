// Testing utilities for the investment platform

export interface TestUser {
  uid: string
  email: string
  displayName: string
  createdAt: Date
}

export interface TestOrder {
  id: string
  userId: string
  planName: string
  amount: number
  status: 'pending' | 'payment_uploaded' | 'paid' | 'processing' | 'payment_rejected'
  createdAt: Date
}

export interface TestKYC {
  id: string
  userId: string
  status: 'not_submitted' | 'pending' | 'submitted' | 'approved' | 'rejected'
  fullName: string
  documentType: string
  documentNumber: string
  submittedAt: Date
}

// Generate test data for development and testing
export const generateTestData = () => {
  const users: TestUser[] = []
  const orders: TestOrder[] = []
  const kycs: TestKYC[] = []

  // Generate test users over the last 12 months
  for (let i = 0; i < 100; i++) {
    const createdAt = new Date()
    createdAt.setMonth(createdAt.getMonth() - Math.floor(Math.random() * 12))
    createdAt.setDate(Math.floor(Math.random() * 28) + 1)

    const user: TestUser = {
      uid: `test-user-${i}`,
      email: `user${i}@test.com`,
      displayName: `Test User ${i}`,
      createdAt
    }
    users.push(user)

    // Generate orders for some users
    if (Math.random() > 0.3) {
      const orderCount = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < orderCount; j++) {
        const orderDate = new Date(createdAt)
        orderDate.setDate(orderDate.getDate() + Math.floor(Math.random() * 30))

        const plans = ['Starter Plan', 'Smart Plan', 'Wealth Plan', 'Growth Plan', 'Premium Plan']
        const amounts = [100000, 200000, 300000, 500000, 1000000]
        const statuses = ['paid', 'processing', 'payment_uploaded', 'pending']

        const order: TestOrder = {
          id: `test-order-${i}-${j}`,
          userId: user.uid,
          planName: plans[Math.floor(Math.random() * plans.length)],
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)] as any,
          createdAt: orderDate
        }
        orders.push(order)
      }
    }

    // Generate KYC for some users
    if (Math.random() > 0.4) {
      const kycDate = new Date(createdAt)
      kycDate.setDate(kycDate.getDate() + Math.floor(Math.random() * 7))

      const statuses = ['approved', 'pending', 'rejected', 'submitted']
      const docTypes = ['aadhaar', 'pan', 'passport', 'driving_license']

      const kyc: TestKYC = {
        id: user.uid,
        userId: user.uid,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        fullName: user.displayName,
        documentType: docTypes[Math.floor(Math.random() * docTypes.length)],
        documentNumber: `DOC${Math.floor(Math.random() * 1000000)}`,
        submittedAt: kycDate
      }
      kycs.push(kyc)
    }
  }

  return { users, orders, kycs }
}

// Validation functions
export const validateUserData = (user: any): boolean => {
  return !!(
    user &&
    user.uid &&
    user.email &&
    user.email.includes('@') &&
    user.createdAt
  )
}

export const validateOrderData = (order: any): boolean => {
  return !!(
    order &&
    order.id &&
    order.userId &&
    order.planName &&
    order.amount &&
    order.amount > 0 &&
    order.status &&
    ['pending', 'payment_uploaded', 'paid', 'processing', 'payment_rejected'].includes(order.status) &&
    order.createdAt
  )
}

export const validateKYCData = (kyc: any): boolean => {
  return !!(
    kyc &&
    kyc.id &&
    kyc.userId &&
    kyc.status &&
    ['not_submitted', 'pending', 'submitted', 'approved', 'rejected'].includes(kyc.status) &&
    kyc.fullName &&
    kyc.documentType &&
    kyc.documentNumber
  )
}

// Performance testing
export const measurePerformance = async (fn: () => Promise<any>, label: string) => {
  const start = performance.now()
  try {
    const result = await fn()
    const end = performance.now()
    console.log(`${label}: ${(end - start).toFixed(2)}ms`)
    return result
  } catch (error) {
    const end = performance.now()
    console.error(`${label} failed after ${(end - start).toFixed(2)}ms:`, error)
    throw error
  }
}

// Data integrity checks
export const checkDataIntegrity = (users: any[], orders: any[], kycs: any[]) => {
  const issues: string[] = []

  // Check for orphaned orders
  const userIds = new Set(users.map(u => u.uid || u.id))
  const orphanedOrders = orders.filter(o => !userIds.has(o.userId))
  if (orphanedOrders.length > 0) {
    issues.push(`Found ${orphanedOrders.length} orphaned orders`)
  }

  // Check for orphaned KYCs
  const orphanedKYCs = kycs.filter(k => !userIds.has(k.userId))
  if (orphanedKYCs.length > 0) {
    issues.push(`Found ${orphanedKYCs.length} orphaned KYC records`)
  }

  // Check for duplicate orders
  const orderIds = orders.map(o => o.id)
  const uniqueOrderIds = new Set(orderIds)
  if (orderIds.length !== uniqueOrderIds.size) {
    issues.push(`Found duplicate order IDs`)
  }

  // Check for users without proper email format
  const invalidEmails = users.filter(u => !u.email || !u.email.includes('@'))
  if (invalidEmails.length > 0) {
    issues.push(`Found ${invalidEmails.length} users with invalid emails`)
  }

  return issues
}

// Analytics calculation testing
export const testAnalyticsCalculations = (users: any[], orders: any[]) => {
  const results = {
    totalUsers: users.length,
    totalOrders: orders.length,
    totalRevenue: orders
      .filter(o => o.status === 'paid' || o.status === 'processing')
      .reduce((sum, o) => sum + (o.amount || 0), 0),
    averageOrderValue: 0,
    conversionRate: 0
  }

  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'processing')
  results.averageOrderValue = paidOrders.length > 0 
    ? results.totalRevenue / paidOrders.length 
    : 0

  results.conversionRate = users.length > 0 
    ? (paidOrders.length / users.length) * 100 
    : 0

  return results
}

export default {
  generateTestData,
  validateUserData,
  validateOrderData,
  validateKYCData,
  measurePerformance,
  checkDataIntegrity,
  testAnalyticsCalculations
}