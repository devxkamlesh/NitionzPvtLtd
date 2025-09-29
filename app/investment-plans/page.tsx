'use client'

import { useState } from 'react'
import { useAuth } from '../components/FirebaseProvider'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Star, TrendingUp, X, Shield, Target, Rocket, BarChart3, Briefcase, Trophy, CreditCard, Clock } from 'lucide-react'
import { useClientSideFormat } from '../lib/formatUtils'

interface InvestmentPlan {
  id: number
  name: string
  icon: any
  description: string
  amount: number
  roi: number
  tenure: number
  finalReturn: number
  popular: boolean
  features: string[]
  expiryDate: Date
}

const investmentPlans = [
  {
    id: 1,
    name: 'Starter Plan',
    icon: Target,
    description: 'Perfect for beginners starting their investment journey.',
    amount: 100000,
    roi: 14,
    tenure: 12,
    finalReturn: 114000,
    popular: false,
    features: ['Beginner Friendly', 'Low Risk', 'Guaranteed Returns'],
    expiryDate: new Date(2025, 11, 31) // December 31, 2025
  },
  {
    id: 2,
    name: 'Smart Plan',
    icon: Rocket,
    description: 'Balanced approach with stable growth and smart returns.',
    amount: 200000,
    roi: 15,
    tenure: 12,
    finalReturn: 230000,
    popular: false,
    features: ['Balanced Risk', 'Smart Growth', 'Regular Updates'],
    expiryDate: new Date(2025, 11, 31)
  },
  {
    id: 3,
    name: 'Wealth Plan',
    icon: BarChart3,
    description: 'Designed for wealth building with higher growth potential.',
    amount: 300000,
    roi: 16,
    tenure: 12,
    finalReturn: 348000,
    popular: true,
    features: ['High Growth', 'Wealth Building', 'Premium Support'],
    expiryDate: new Date(2025, 11, 31)
  },
  {
    id: 4,
    name: 'Growth Plan',
    icon: Briefcase,
    description: 'Strong and secure returns for serious investors.',
    amount: 500000,
    roi: 18,
    tenure: 12,
    finalReturn: 590000,
    popular: false,
    features: ['High Returns', 'Secure Investment', 'Priority Support'],
    expiryDate: new Date(2025, 11, 31)
  },
  {
    id: 5,
    name: 'Premium Plan',
    icon: Trophy,
    description: 'Maximum returns for elite investors seeking premium growth.',
    amount: 1000000,
    roi: 20,
    tenure: 12,
    finalReturn: 1200000,
    popular: false,
    features: ['Maximum Returns', 'Elite Status', 'Dedicated Manager'],
    expiryDate: new Date(2025, 11, 31)
  }
]



export default function InvestmentPlansPage() {
  const { user } = useAuth()
  const { formatCurrency, formatNumber } = useClientSideFormat()
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleBuyPlan = async (plan: InvestmentPlan) => {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    // Check user status before allowing investment
    try {
      const response = await fetch('/api/user/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      })
      const result = await response.json()
      
      if (result.success && (result.status === 'banned' || result.status === 'suspended')) {
        alert('Your account has been restricted. Please contact support.')
        window.location.href = '/auth/banned'
        return
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    }

    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }



  const getPlanBadge = (plan: InvestmentPlan) => {
    switch (plan.name) {
      case 'Starter Plan':
        return (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg border-2 border-green-300 whitespace-nowrap">
              BEGINNER FRIENDLY
            </div>
          </div>
        )
      case 'Smart Plan':
        return (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg border-2 border-blue-300 whitespace-nowrap">
              SMART CHOICE
            </div>
          </div>
        )
      case 'Wealth Plan':
        return (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg border-2 border-purple-300 whitespace-nowrap">
              WEALTH BUILDER
            </div>
          </div>
        )
      case 'Growth Plan':
        return (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg border-2 border-orange-300 whitespace-nowrap">
              HIGH GROWTH
            </div>
          </div>
        )
      case 'Premium Plan':
        return (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black px-6 py-2 rounded-full text-sm font-bold shadow-xl border-2 border-yellow-300 whitespace-nowrap">
              ⭐ PREMIUM ELITE ⭐
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPlan) return

    setLoading(true)
    setMessage('')

    try {
      // Redirect to custom payment gateway
      window.location.href = `/payment/gateway?planId=${selectedPlan.id}&amount=${selectedPlan.amount}&planName=${encodeURIComponent(selectedPlan.name)}&type=investment`
      
      setShowPaymentModal(false)
      setSelectedPlan(null)
      
    } catch (error) {
      console.error('Error submitting payment:', error)
      setMessage('Error processing payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-nitionz-blue via-blue-700 to-blue-900 flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Fixed Deposit Investment Plans</h1>
            <p className="text-xl text-white/90">Secure Fixed Deposits with High Returns 14-20% Annually</p>
          </div>
        </div>
      </section>

      <main className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-5">
          {message && (
            <div className={`mb-8 p-4 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Investment Plans</h2>
            <p className="text-xl text-gray-600">Secure your future with trusted Fixed Deposits. Safe, reliable, and transparent investments for everyone.</p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {investmentPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative ${
                  plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
                } ${plan.name === 'Premium Plan' ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50' : ''}`}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-nitionz-blue/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                
                {getPlanBadge(plan)}
                {plan.popular && (
                  <div className="absolute -top-2 -left-2 group">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Most Popular
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                    </div>
                  </div>
                )}
                
                {/* Plan Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-nitionz-blue to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <plan.icon className="w-10 h-10 text-white" />
                </div>
                
                {/* Plan Details */}
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{plan.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{plan.description}</p>
                
                {/* Investment Amount */}
                <div className="bg-gradient-to-r from-nitionz-blue/10 to-blue-100 p-4 rounded-xl mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Investment Amount</p>
                    <div className="text-3xl font-bold text-nitionz-blue">{formatCurrency(plan.amount)}</div>
                  </div>
                </div>
                
                {/* Plan Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Returns Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ROI</p>
                    <p className="font-bold text-green-600">{plan.roi}%</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Tenure</p>
                    <p className="font-bold text-blue-600">{plan.tenure}M</p>
                  </div>
                </div>
                
                {/* Final Return */}
                <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-200">
                  <div className="text-center">
                    <p className="text-sm text-green-700 mb-1">Expected Return</p>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(plan.finalReturn)}</div>
                  </div>
                </div>
                
                {/* Plan Expiry */}
                <div className="bg-yellow-50 p-3 rounded-lg mb-6 border border-yellow-200">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">
                      Plan expires: {plan.expiryDate.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <button
                  onClick={() => handleBuyPlan(plan)}
                  className="w-full bg-gradient-to-r from-nitionz-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {user ? 'Invest Now' : 'Login to Invest'}
                </button>
              </div>
            ))}
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Why Choose Nitionz?</h2>
            <p className="text-xl text-gray-600 text-center mb-8">Your trusted partner for secure investments</p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-nitionz-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-nitionz-blue" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Secure & Safe</h3>
                <p className="text-gray-600">All investments are secured with proper documentation and regulatory compliance.</p>
              </div>

              <div className="text-center p-6">
                <div className="bg-nitionz-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-nitionz-blue" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">High Returns</h3>
                <p className="text-gray-600">Competitive returns ranging from 14% to 20% annually on your investments.</p>
              </div>

              <div className="text-center p-6">
                <div className="bg-nitionz-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-nitionz-blue" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Expert Support</h3>
                <p className="text-gray-600">Dedicated support team available Monday to Saturday to assist with your investments.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Complete Your Investment</h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setAcceptedTerms(false)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Plan Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">{selectedPlan.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Investment Amount:</span>
                    <span className="font-semibold ml-2">{formatCurrency(selectedPlan.amount)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Expected Return:</span>
                    <span className="font-semibold ml-2">{formatCurrency(selectedPlan.finalReturn)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">ROI:</span>
                    <span className="font-semibold ml-2">{selectedPlan.roi}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Tenure:</span>
                    <span className="font-semibold ml-2">{selectedPlan.tenure} Months</span>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Section */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Bank Transfer Payment
                </h4>
                <p className="text-sm text-yellow-700">
                  You will be redirected to our secure payment gateway to complete your bank transfer or UPI payment.
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-nitionz-blue focus:ring-nitionz-blue border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <a 
                      href="/legal/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-nitionz-blue hover:text-blue-700 underline"
                    >
                      Terms & Conditions
                    </a>
                    {' '}and{' '}
                    <a 
                      href="/legal/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-nitionz-blue hover:text-blue-700 underline"
                    >
                      Privacy Policy
                    </a>
                    . I understand that this is a fixed deposit investment with the specified terms and conditions.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false)
                      setAcceptedTerms(false)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !acceptedTerms}
                    className="flex-1 bg-nitionz-blue text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}