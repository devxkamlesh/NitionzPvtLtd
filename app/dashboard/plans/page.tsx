'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../components/FirebaseProvider'
import DashboardLayout from '../../components/DashboardLayout'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { uploadToCloudinary } from '../../lib/cloudinary'
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Plus,
  Eye,
  Download,
  Upload,
  X,
  Target,
  Rocket,
  BarChart3,
  Briefcase,
  Trophy
} from 'lucide-react'
import { useClientSideFormat } from '../../lib/formatUtils'
import PortfolioChart from '../../components/PortfolioChart'

interface Order {
  id: string
  planName: string
  amount: number
  status: string
  createdAt: any
  paidAt?: any
  expiryAt?: any
  paymentProof?: {
    url: string
    note?: string
  }
  certificate?: {
    url: string
    uploadedAt: string
    uploadedBy: string
  }
}

export default function MyPlansPage() {
  const { user } = useAuth()
  const { formatCurrency } = useClientSideFormat()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showReuploadModal, setShowReuploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [paymentNote, setPaymentNote] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid)
          )
          const ordersSnapshot = await getDocs(ordersQuery)
          const ordersData = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Order[]
          
          setOrders(ordersData.sort((a, b) => 
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          ))
        } catch (error) {
          console.error('Error fetching orders:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchOrders()
  }, [user])

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    
    try {
      let dateObj: Date
      
      // Handle Firestore Timestamp
      if (date && typeof date.toDate === 'function') {
        dateObj = date.toDate()
      }
      // Handle Firestore Timestamp with seconds
      else if (date && typeof date.seconds === 'number') {
        dateObj = new Date(date.seconds * 1000)
      }
      // Handle ISO string
      else if (typeof date === 'string') {
        dateObj = new Date(date)
      }
      // Handle Date object
      else if (date instanceof Date) {
        dateObj = date
      }
      // Handle timestamp number
      else if (typeof date === 'number') {
        dateObj = new Date(date)
      }
      else {
        return 'Invalid Date'
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
      }
      
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return 'bg-green-100 text-green-800'
      case 'payment_uploaded':
        return 'bg-yellow-100 text-yellow-800'
      case 'payment_rejected':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Active'
      case 'processing': return 'Processing'
      case 'payment_uploaded': return 'Pending Verification'
      case 'payment_rejected': return 'Payment Rejected'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const getDaysRemaining = (expiryDate: any) => {
    if (!expiryDate) return null
    
    let expiryObj
    if (expiryDate.toDate) {
      expiryObj = expiryDate.toDate()
    } else if (expiryDate.seconds) {
      expiryObj = new Date(expiryDate.seconds * 1000)
    } else {
      expiryObj = new Date(expiryDate)
    }
    
    const today = new Date()
    const diffTime = expiryObj.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const handleReuploadProof = async (file: File) => {
    if (!selectedOrder) return

    setUploading(true)
    try {
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file)
      
      // Update order with new payment proof
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        paymentProof: {
          url: imageUrl,
          note: paymentNote.trim() || undefined
        },
        status: 'payment_uploaded',
        updatedAt: new Date()
      })

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { 
              ...order, 
              paymentProof: {
                url: imageUrl,
                note: paymentNote.trim() || undefined
              },
              status: 'payment_uploaded' as const
            }
          : order
      ))

      setShowReuploadModal(false)
      setPaymentNote('')
      alert('Payment proof uploaded successfully!')
    } catch (error) {
      console.error('Error uploading payment proof:', error)
      alert('Failed to upload payment proof. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      handleReuploadProof(file)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nitionz-blue"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Investment Plans</h1>
            <p className="text-gray-600">Track and manage your active investments</p>
          </div>
          <a 
            href="/investment-plans"
            className="bg-nitionz-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Investment</span>
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'paid' || o.status === 'processing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'payment_uploaded').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(orders.filter(o => o.status === 'paid' || o.status === 'processing')
                    .reduce((sum, o) => sum + o.amount, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Investment Growth Chart */}
        <PortfolioChart 
          totalInvested={orders.filter(o => o.status === 'paid' || o.status === 'processing')
            .reduce((sum, o) => sum + o.amount, 0)} 
          expectedReturns={Math.round(orders.filter(o => o.status === 'paid' || o.status === 'processing')
            .reduce((sum, o) => sum + o.amount, 0) * 0.16)}
          orders={orders}
        />

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Investment History</h2>
          </div>
          
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => {
                const daysRemaining = getDaysRemaining(order.expiryAt)
                
                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-nitionz-blue/10 rounded-lg flex items-center justify-center">
                            {order.planName.includes('Starter') && <Target className="w-6 h-6 text-nitionz-blue" />}
                            {order.planName.includes('Smart') && <Rocket className="w-6 h-6 text-nitionz-blue" />}
                            {order.planName.includes('Wealth') && <BarChart3 className="w-6 h-6 text-nitionz-blue" />}
                            {order.planName.includes('Growth') && <Briefcase className="w-6 h-6 text-nitionz-blue" />}
                            {order.planName.includes('Premium') && <Trophy className="w-6 h-6 text-nitionz-blue" />}
                            {!order.planName.includes('Starter') && !order.planName.includes('Smart') && !order.planName.includes('Wealth') && !order.planName.includes('Growth') && !order.planName.includes('Premium') && <CreditCard className="w-6 h-6 text-nitionz-blue" />}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{order.planName}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Started: {formatDate(order.createdAt)}
                              </span>
                              {order.expiryAt && (
                                <span className="text-sm text-gray-500">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  Expires: {formatDate(order.expiryAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(order.amount)}</p>
                          {daysRemaining !== null && (
                            <p className={`text-sm ${daysRemaining > 30 ? 'text-green-600' : daysRemaining > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          {(order as any).certificate && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Certified</span>
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar for Active Plans */}
                    {(order.status === 'paid' || order.status === 'processing') && order.expiryAt && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Investment Progress</span>
                          <span>{daysRemaining && daysRemaining > 0 ? `${Math.round((365 - daysRemaining) / 365 * 100)}%` : '100%'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-nitionz-blue h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: daysRemaining && daysRemaining > 0 
                                ? `${Math.round((365 - daysRemaining) / 365 * 100)}%` 
                                : '100%' 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Investment Plans Yet</h3>
              <p className="text-gray-500 mb-6">Start your investment journey with our secure fixed deposit plans</p>
              <a 
                href="/investment-plans"
                className="bg-nitionz-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Browse Investment Plans
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Investment Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                    <p className="text-gray-900">{selectedOrder.planName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <p className="text-gray-900">{formatCurrency(selectedOrder.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                    <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                {selectedOrder.paymentProof && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Proof</label>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Payment receipt uploaded</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              try {
                                window.open(selectedOrder.paymentProof!.url, '_blank', 'noopener,noreferrer')
                              } catch (error) {
                                console.error('View error:', error)
                                alert('Something went wrong while opening the payment proof. Please contact support.')
                              }
                            }}
                            className="text-nitionz-blue hover:text-blue-700 text-sm flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              try {
                                const link = document.createElement('a')
                                link.href = selectedOrder.paymentProof!.url
                                link.download = `payment-proof-${selectedOrder.id}.jpg`
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              } catch (error) {
                                console.error('Download error:', error)
                                alert('Something went wrong while downloading the payment proof. Please try viewing it instead.')
                              }
                            }}
                            className="text-nitionz-blue hover:text-blue-700 text-sm flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                      {selectedOrder.paymentProof.note && (
                        <p className="text-sm text-gray-600 mt-2">Note: {selectedOrder.paymentProof.note}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.certificate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Investment Certificate</label>
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-green-800 font-medium">Certificate Available</span>
                          <p className="text-xs text-green-600 mt-1">
                            Uploaded on {new Date(selectedOrder.certificate.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              try {
                                window.open(selectedOrder.certificate!.url, '_blank', 'noopener,noreferrer')
                              } catch (error) {
                                console.error('View error:', error)
                                alert('Something went wrong while opening the certificate. Please contact support.')
                              }
                            }}
                            className="text-green-600 hover:text-green-800 text-sm flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              try {
                                // Create a temporary link element for download
                                const link = document.createElement('a')
                                link.href = selectedOrder.certificate!.url
                                link.download = `investment-certificate-${selectedOrder.id}.pdf`
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              } catch (error) {
                                console.error('Download error:', error)
                                alert('Something went wrong while downloading the certificate. Please try viewing it instead.')
                              }
                            }}
                            className="text-green-600 hover:text-green-800 text-sm flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedOrder.paymentProof && selectedOrder.status === 'pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Please upload your payment proof to proceed with verification.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                  {(selectedOrder.status === 'payment_uploaded' || selectedOrder.status === 'pending') && (
                    <button 
                      onClick={() => setShowReuploadModal(true)}
                      className="flex-1 bg-nitionz-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{selectedOrder.paymentProof ? 'Re-upload Proof' : 'Upload Proof'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reupload Modal */}
      {showReuploadModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedOrder.paymentProof ? 'Re-upload Payment Proof' : 'Upload Payment Proof'}
                </h3>
                <button
                  onClick={() => setShowReuploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Note (Optional)
                  </label>
                  <textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Add any additional information about your payment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Payment Proof Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>

                {uploading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nitionz-blue"></div>
                    <span className="ml-2 text-gray-600">Uploading...</span>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowReuploadModal(false)}
                    disabled={uploading}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}