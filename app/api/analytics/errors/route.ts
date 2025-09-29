import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log error for monitoring
    console.error('Application error:', {
      ...body,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Error logged successfully'
    })

  } catch (error) {
    console.error('Error logging error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log error' },
      { status: 500 }
    )
  }
}