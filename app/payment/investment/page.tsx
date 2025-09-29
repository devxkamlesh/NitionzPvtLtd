'use client'

import { useEffect, useState, Suspense } from 'react'
import { useAuth } from '../../components/FirebaseProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { 
  CreditCard, 
  Building, 
  Copy, 
  CheckCircle, 
  ArrowLeft,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react'

interface BankDetail {
  id: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  ifscCode: string
  branchName: string
  isDefault: boolean
  isActive: boolean
}

function InvestmentPaymentPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')
  const amount = searchParams.get('amount')
  const planName = searchParams.get('planName')
  
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([])
  const [selectedBank, setSelectedBank] = useState<BankDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'upi'>('bank')
  const [transactionId, setTransactionId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user || !amount || !planId || !planName) {
      router.push('/investment-plans')
      return
    }

    const fetchBankDetails = async () => {
      try {
        const bankSnapshot = await getDocs(collection(db, 'bankDetails'))
        const banks = bankSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as BankDetail))
          .filter(bank => bank.isActive)
          .sort((a, b) => b.isDefault ? 1 : -1)
        
        setBankDetails(banks)
        if (banks.length > 0) {
          setSelectedBank(banks.find(bank => bank.isDefault) || banks[0])
        }
      } catch (error) {
        console.error('Error fetching bank details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBankDetails()
  }, [user, amount, planId, planName, router])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
  }

  const handlePaymentConfirmation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transactionId.trim()) return

    setSubmitting(true)
    try {
      // Create order with pending status
      await addDoc(collection(db, 'orders'), {
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || 'User',
        planId: parseInt(planId || '0'),
        planName: decodeURIComponent(planName || ''),
        amount: parseFloat(amount || '0'),
        status: 'payment_uploaded',
        paymentMethod: paymentMethod === 'bank' ? 'bank_transfer' : 'upi',
        transactionId: transactionId.trim(),
        bankDetails: selectedBank,
        createdAt: serverTimestamp()
      })

      // Redirect to success page
      router.push(`/payment/success?amount=${amount}&type=investment&planName=${planName}`)
    } catch (error) {
      console.error('Error submitting payment confirmation:', error)
      alert('Failed to submit payment confirmation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!selectedBank) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Bank Details Available</h2>
          <p className="text-gray-600 mb-4">Please contact support to complete your investment.</p>
          <button
            onClick={() => router.push('/investment-plans')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/investment-plans')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Investment Plans</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Investment</h1>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">{decodeURIComponent(planName || '')}</span>
              </div>
              <p className="text-blue-700">Investment Amount: ₹{parseFloat(amount || '0').toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setPaymentMethod('bank')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                paymentMethod === 'bank'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Bank Transfer</p>
              <p className="text-sm text-gray-500">NEFT/RTGS/IMPS</p>
            </button>
            
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                paymentMethod === 'upi'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">UPI Payment</p>
              <p className="text-sm text-gray-500">PhonePe/GPay/Paytm</p>
            </button>
          </div>
        </div>

        {/* Bank Selection */}
        {bankDetails.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Bank Account</h2>
            
            <div className="space-y-3">
              {bankDetails.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedBank?.id === bank.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bank.bankName}</p>
                      <p className="text-sm text-gray-500">{bank.accountHolderName}</p>
                    </div>
                    {bank.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
          
          {paymentMethod === 'bank' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="font-medium">{selectedBank.bankName}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedBank.bankName, 'bankName')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {copied === 'bankName' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Account Holder</p>
                      <p className="font-medium">{selectedBank.accountHolderName}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedBank.accountHolderName, 'accountHolder')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {copied === 'accountHolder' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="font-mono font-medium">{selectedBank.accountNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedBank.accountNumber, 'accountNumber')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {copied === 'accountNumber' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">IFSC Code</p>
                      <p className="font-mono font-medium">{selectedBank.ifscCode}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedBank.ifscCode, 'ifscCode')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {copied === 'ifscCode' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Branch Name</p>
                    <p className="font-medium">{selectedBank.branchName}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedBank.branchName, 'branchName')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copied === 'branchName' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Amount to Transfer</p>
                    <p className="text-xl font-bold text-blue-800">₹{parseFloat(amount || '0').toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(amount || '0', 'amount')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copied === 'amount' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <p className="text-lg font-medium mb-2">UPI Payment</p>
                <p className="text-2xl font-bold text-blue-600 mb-2">₹{parseFloat(amount || '0').toLocaleString()}</p>
                <p className="text-sm text-gray-600">
                  Pay using any UPI app to: <span className="font-mono font-medium">nitionz@paytm</span>
                </p>
                <button
                  onClick={() => copyToClipboard('nitionz@paytm', 'upiId')}
                  className="mt-2 text-blue-600 hover:text-blue-800 flex items-center space-x-1 mx-auto"
                >
                  {copied === 'upiId' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>Copy UPI ID</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Confirmation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Payment</h2>
          
          <form onSubmit={handlePaymentConfirmation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID / Reference Number
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter transaction ID from your bank/UPI app"
              />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Important Instructions:</p>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• Complete the payment using the details provided above</li>
                    <li>• Enter the transaction ID you received after payment</li>
                    <li>• Your investment will be activated after verification (24-48 hours)</li>
                    <li>• Keep the transaction receipt for your records</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !transactionId.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Investment Payment</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function InvestmentPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <InvestmentPaymentPageContent />
    </Suspense>
  )
}