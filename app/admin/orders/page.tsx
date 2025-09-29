'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../lib/firebase'
import DashboardLayout from '../../components/DashboardLayout'
import { 
  CreditCard, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  User,
  Calendar,
  Search,
  Download,
  Upload,
  FileText
} from 'lucide-react'

interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  planName: string
  amount: number
  status: 'pending' | 'payment_uploaded' | 'paid' | 'processing' | 'cancelled'
  paymentProof?: string
  paymentNote?: string
  adminNote?: string
  certificate?: {
    url: string
    uploadedAt: string
    uploadedBy: string
  }
  createdAt: any
  updatedAt?: any
}

export default function AdminOrdersPage() {
  const [user] = useAuthState(auth)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [processing, setProcessing] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'payment_uploaded' | 'paid' | 'processing' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      fetchOrders()
    } else if (user) {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let filtered = orders

    if (filter !== 'all') {
      filtered = filtered.filter(order => order.status === filter)
    }

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.planName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
  }, [orders, filter, searchTerm])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const result = await response.json()
      
      if (result.success) {
        setOrders(result.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    setProcessing(orderId)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status,
          adminNote: adminNote.trim() || undefined
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: status as Order['status'], adminNote: adminNote.trim(), updatedAt: new Date() }
            : order
        ))
        setSelectedOrder(null)
        setAdminNote('')
      } else {
        alert('Failed to update order: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order')
    } finally {
      setProcessing('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50'
      case 'processing': return 'text-blue-600 bg-blue-50'
      case 'payment_uploaded': return 'text-yellow-600 bg-yellow-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Clock className="w-4 h-4" />
      case 'payment_uploaded': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleCertificateUpload = async () => {
    if (!certificateFile || !selectedOrder) return

    setUploadingCertificate(true)
    try {
      // Upload certificate file
      const formData = new FormData()
      formData.append('file', certificateFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload certificate')
      }

      const uploadResult = await uploadResponse.json()

      // Update order with certificate
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          certificate: {
            url: uploadResult.url,
            uploadedAt: new Date().toISOString(),
            uploadedBy: user?.email || 'admin'
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === selectedOrder.id 
            ? { 
                ...order, 
                certificate: {
                  url: uploadResult.url,
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: user?.email || 'admin'
                }
              }
            : order
        ))
        
        // Update selected order
        setSelectedOrder(prev => prev ? {
          ...prev,
          certificate: {
            url: uploadResult.url,
            uploadedAt: new Date().toISOString(),
            uploadedBy: user?.email || 'admin'
          }
        } : null)

        setShowCertificateModal(false)
        setCertificateFile(null)
        alert('Certificate uploaded successfully!')
      } else {
        alert('Failed to upload certificate: ' + result.error)
      }
    } catch (error) {
      console.error('Error uploading certificate:', error)
      alert('Failed to upload certificate')
    } finally {
      setUploadingCertificate(false)
    }
  }

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
      
      return dateObj.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting datetime:', error)
      return 'Invalid Date'
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  if (!user || user?.email !== 'admin@nitionzpvtltd.com') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nitionz-blue"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders & Payments</h1>
          <p className="text-gray-600">Manage customer orders and payment confirmations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'payment_uploaded').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'paid').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by user name, email, or plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              {(['all', 'payment_uploaded', 'paid', 'processing', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === status
                      ? 'bg-nitionz-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan & Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50 relative ${
                    order.status === 'paid' || order.status === 'processing' ? 'bg-green-50 opacity-75' : 
                    order.status === 'cancelled' ? 'bg-red-50 opacity-75' : ''
                  }`}>
                    {(order.status === 'paid' || order.status === 'processing') && (
                      <td className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></td>
                    )}
                    {order.status === 'cancelled' && (
                      <td className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{order.userName || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{order.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.planName}</div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-nitionz-blue hover:text-blue-700 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>

        {/* Order Review Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Order Review</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{selectedOrder.userName}</p>
                        <p className="text-sm text-gray-500">{selectedOrder.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Plan</p>
                        <p className="font-medium">{selectedOrder.planName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">{formatCurrency(selectedOrder.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Proof */}
                  {selectedOrder.paymentProof && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Payment Proof</h3>
                        <a
                          href={selectedOrder.paymentProof}
                          download={`payment-proof-${selectedOrder.id}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                      </div>
                      <div className="border rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={selectedOrder.paymentProof}
                          alt="Payment Proof"
                          className="w-full h-auto max-h-96 object-contain cursor-pointer"
                          onClick={() => window.open(selectedOrder.paymentProof, '_blank')}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'p-8 text-center text-red-600';
                            errorDiv.innerHTML = '<p>Failed to load payment proof image</p><p class="text-sm text-gray-500 mt-2">The image may have been deleted or the URL is invalid</p>';
                            target.parentNode?.appendChild(errorDiv);
                          }}
                        />
                      </div>
                      {selectedOrder.paymentNote && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Customer Note:</strong> {selectedOrder.paymentNote}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Payment Proof Message */}
                  {!selectedOrder.paymentProof && selectedOrder.status === 'payment_uploaded' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800">
                        <strong>Warning:</strong> This order is marked as having payment uploaded, but no payment proof image is available.
                      </p>
                    </div>
                  )}

                  {/* Admin Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Note (Optional)
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add a note about this order..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Certificate Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Investment Certificate</h3>
                      {!selectedOrder.certificate && selectedOrder.status === 'payment_uploaded' && (
                        <button
                          onClick={() => setShowCertificateModal(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload Certificate</span>
                        </button>
                      )}
                    </div>
                    
                    {selectedOrder.certificate ? (
                      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">Certificate Uploaded</p>
                            <p className="text-xs text-green-600 mt-1">
                              Uploaded on {formatDate(selectedOrder.certificate.uploadedAt)} by {selectedOrder.certificate.uploadedBy}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <a
                              href={selectedOrder.certificate.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-sm flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </a>
                            <a
                              href={selectedOrder.certificate.url}
                              download={`certificate-${selectedOrder.id}.pdf`}
                              className="text-green-600 hover:text-green-800 text-sm flex items-center space-x-1"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <p className="text-sm text-gray-600 text-center">
                          No certificate uploaded yet. Upload a certificate after confirming payment.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedOrder.status === 'payment_uploaded' && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'paid')}
                        disabled={processing === selectedOrder.id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Payment
                      </button>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                        disabled={processing === selectedOrder.id}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Payment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Upload Modal */}
        {showCertificateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Upload Investment Certificate</h2>
                  <button
                    onClick={() => {
                      setShowCertificateModal(false)
                      setCertificateFile(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {selectedOrder.planName}
                        </p>
                        <p className="text-xs text-blue-600">
                          Customer: {selectedOrder.userName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Certificate File (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Please upload the investment certificate in PDF format
                    </p>
                  </div>

                  {uploadingCertificate && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Uploading certificate...</span>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowCertificateModal(false)
                        setCertificateFile(null)
                      }}
                      disabled={uploadingCertificate}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCertificateUpload}
                      disabled={!certificateFile || uploadingCertificate}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingCertificate ? 'Uploading...' : 'Upload Certificate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}