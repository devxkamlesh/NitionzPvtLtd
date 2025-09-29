import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Mock data for queries
    const queries = [
      {
        id: '1',
        userId: 'user1',
        type: 'technical',
        subject: 'Login Issue',
        message: 'Cannot access my account',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        userId: 'user2',
        type: 'billing',
        subject: 'Payment Failed',
        message: 'My payment was declined',
        status: 'resolved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    let filteredQueries = queries

    if (status) {
      filteredQueries = filteredQueries.filter(q => q.status === status)
    }

    if (type) {
      filteredQueries = filteredQueries.filter(q => q.type === type)
    }

    return NextResponse.json({
      success: true,
      queries: filteredQueries,
      total: filteredQueries.length
    })

  } catch (error) {
    console.error('Error fetching queries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch queries' },
      { status: 500 }
    )
  }
}