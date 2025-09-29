import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    // Mock data for support tickets
    const tickets = [
      {
        id: '1',
        userId: 'user1',
        subject: 'Account Verification',
        message: 'Need help with KYC verification',
        status: 'open',
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        userId: 'user2',
        subject: 'Investment Query',
        message: 'Questions about investment plans',
        status: 'closed',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    let filteredTickets = tickets

    if (status) {
      filteredTickets = filteredTickets.filter(t => t.status === status)
    }

    return NextResponse.json({
      success: true,
      tickets: filteredTickets,
      total: filteredTickets.length
    })

  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}