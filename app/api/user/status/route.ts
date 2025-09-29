import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Mock user status data
    const userStatus = {
      id: userId,
      status: 'active',
      kycStatus: 'approved',
      emailVerified: true,
      phoneVerified: true,
      investmentCount: 3,
      totalInvested: 150000,
      lastLogin: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      userStatus
    })

  } catch (error) {
    console.error('Error fetching user status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user status' },
      { status: 500 }
    )
  }
}