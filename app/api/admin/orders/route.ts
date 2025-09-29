import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Mock order data
    const orders = [
      {
        id: '1',
        userId: 'user1',
        planId: 'basic',
        amount: 10000,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        userId: 'user2', 
        planId: 'premium',
        amount: 50000,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    let filteredOrders = orders

    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status)
    }

    if (userId) {
      filteredOrders = filteredOrders.filter(o => o.userId === userId)
    }

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      total: filteredOrders.length
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}