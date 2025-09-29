import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Mock analytics data
    const metrics = {
      totalUsers: 1250,
      totalRevenue: 2500000,
      totalInvestments: 850,
      activeUsers: 980,
      monthlyGrowth: 15.5,
      revenueGrowth: 22.3
    }

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log analytics event
    console.log('Analytics event:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Event logged successfully'
    })

  } catch (error) {
    console.error('Error logging analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log event' },
      { status: 500 }
    )
  }
}