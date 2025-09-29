'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Home, LayoutDashboard } from 'lucide-react'

function PaymentSuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amount = searchParams.get('amount')
  const type = searchParams.get('type')
  const planName = searchParams.get('planName')

  useEffect(() => {
    // Auto redirect after 8 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 8000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted Successfully!</h1>
          
          <p className="text-gray-600 mb-6">
            Your investment payment of ₹{parseFloat(amount || '0').toLocaleString()} has been submitted successfully.
          </p>

          {planName && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800 font-medium">
                Investment Plan: {decodeURIComponent(planName)}
              </p>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg mb-6 border-l-4 border-green-400">
            <p className="text-sm text-green-800">
              <strong>What's Next?</strong><br />
              Our team will verify your payment and activate your investment plan within 24-48 hours. You'll receive a notification once your investment is active.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-nitionz-blue text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Redirecting to dashboard in 8 seconds...
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading success page...</p>
        </div>
      </div>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  )
}