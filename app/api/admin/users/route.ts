import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    // Mock user data for development
    const users = [
      {
        id: '1',
        email: 'user1@example.com',
        displayName: 'John Doe',
        createdAt: new Date().toISOString(),
        status: 'active',
        kycStatus: 'approved'
      },
      {
        id: '2', 
        email: 'user2@example.com',
        displayName: 'Jane Smith',
        createdAt: new Date().toISOString(),
        status: 'active',
        kycStatus: 'pending'
      }
    ]

    if (userId) {
      const user = users.find(u => u.id === userId)
      return NextResponse.json({ success: true, user })
    }

    return NextResponse.json({ success: true, users })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}