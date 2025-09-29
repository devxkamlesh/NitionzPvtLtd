'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../lib/firebase'
import DashboardLayout from '../../components/DashboardLayout'
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  query, 
  orderBy
} from 'firebase/firestore'
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  Search,
  Download,
  Edit,
  RefreshCw,
  Save
} from 'lucide-react'

interface KYCSubmission {
  id: string
  userId: string
  userEmail?: string
  userName?: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  documentType: string
  documentNumber: string
  fullName: string
  dateOfBirth: string
  address: string
  documentUrl?: string
  submittedAt?: string
  reviewedAt?: string
  rejectionReason?: string
}

const documentTypes = {
  'aadhaar': 'Aadhaar Card',
  'pan': 'PAN Card',
  'passport': 'Passport',
  'driving_license': 'Driving License',
  'voter_id': 'Voter ID'
}

export default function AdminKYCManagementPage() {
  const [user] = useAuthState(auth)
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [processing, setProcessing] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [filter, setFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSubmission, setEditingSubmission] = useState<KYCSubmission | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      const q = query(collection(db, 'kyc'), orderBy('submittedAt', 'desc'))
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const kycData: KYCSubmission[] = []
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          
          // Fetch user details from multiple sources
          try {
            // First try to get from the KYC data itself
            let userEmail = data.userEmail || 'Unknown'
            let userName = data.userName || data.fullName || 'Unknown User'
            
            // If not available, try to fetch from API
            if (userEmail === 'Unknown' || userName === 'Unknown User') {
              try {
                const userResponse = await fetch(`/api/admin/users?userId=${docSnap.id}`)
                const userResult = await userResponse.json()
                
                if (userResult.success && userResult.user) {
                  userEmail = userResult.user.email || userEmail
                  userName = userResult.user.displayName || userResult.user.name || userName
                }
              } catch (apiError) {
                console.log('API fetch failed, using KYC data')
              }
            }
            
            kycData.push({
              id: docSnap.id,
              userId: docSnap.id,
              userEmail,
              userName,
              ...data
            } as KYCSubmission)
          } catch (error) {
            console.error('Error processing KYC data:', error)
            kycData.push({
              id: docSnap.id,
              userId: docSnap.id,
              userEmail: data.userEmail || 'Unknown',
              userName: data.userName || data.fullName || 'Unknown User',
              ...data
            } as KYCSubmission)
          }
        }
        
        setSubmissions(kycData)
        setLoading(false)
      })

      return () => unsubscribe()
    } else if (user) {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let filtered = submissions

    if (filter !== 'all') {
      filtered = filtered.filter(submission => submission.status === filter)
    }

    if (searchTerm) {
      filtered = filtered.filter(submission => 
        submission.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSubmissions(filtered)
  }, [submissions, filter, searchTerm])

  const updateKYCStatus = async (submissionId: string, status: 'approved' | 'rejected', reason?: string) => {
    setProcessing(submissionId)
    try {
      const updateData: any = {
        status,
        reviewedAt: new Date().toISOString()
      }

      if (status === 'rejected' && reason) {
        updateData.rejectionReason = reason
      }

      await updateDoc(doc(db, 'kyc', submissionId), updateData)
      
      setSelectedSubmission(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error updating KYC status:', error)
      alert('Failed to update KYC status')
    } finally {
      setProcessing('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      case 'submitted': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'submitted': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const formatDate = (date: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  const handleEditKYC = (submission: KYCSubmission) => {
    setEditingSubmission(submission)
    setEditFormData({
      fullName: submission.fullName,
      dateOfBirth: submission.dateOfBirth,
      address: submission.address,
      documentType: submission.documentType,
      documentNumber: submission.documentNumber
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingSubmission) return

    setProcessing(editingSubmission.id)
    try {
      await updateDoc(doc(db, 'kyc', editingSubmission.id), {
        ...editFormData,
        updatedAt: new Date().toISOString(),
        status: 'submitted' // Reset to submitted after edit
      })
      
      setShowEditModal(false)
      setEditingSubmission(null)
      setEditFormData({})
      alert('KYC details updated successfully')
    } catch (error) {
      console.error('Error updating KYC:', error)
      alert('Failed to update KYC details')
    } finally {
      setProcessing('')
    }
  }

  const handleResubmitKYC = async (submissionId: string) => {
    if (!confirm('Are you sure you want to resubmit this KYC for review?')) return

    setProcessing(submissionId)
    try {
      await updateDoc(doc(db, 'kyc', submissionId), {
        status: 'submitted',
        resubmittedAt: new Date().toISOString(),
        rejectionReason: null
      })
      
      alert('KYC resubmitted successfully')
    } catch (error) {
      console.error('Error resubmitting KYC:', error)
      alert('Failed to resubmit KYC')
    } finally {
      setProcessing('')
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Management</h1>
          <p className="text-gray-600">Review and manage user KYC submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.status === 'submitted').length}
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
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.status === 'rejected').length}
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
                  placeholder="Search by name, email, or document number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              {(['all', 'submitted', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === status
                      ? 'bg-nitionz-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KYC Submissions Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className={`hover:bg-gray-50 ${
                    submission.status === 'approved' ? 'bg-green-50 opacity-75' : 
                    submission.status === 'rejected' ? 'bg-red-50 opacity-75' : ''
                  }`}>
                    {(submission.status === 'approved' || submission.status === 'rejected') && (
                      <td className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" style={{
                        backgroundColor: submission.status === 'approved' ? '#10b981' : '#ef4444'
                      }}></td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{submission.userName}</div>
                          <div className="text-sm text-gray-500">{submission.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {documentTypes[submission.documentType as keyof typeof documentTypes]}
                      </div>
                      <div className="text-sm text-gray-500">{submission.documentNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(submission.submittedAt || '')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-nitionz-blue hover:text-blue-700 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </button>
                        
                        <button
                          onClick={() => handleEditKYC(submission)}
                          className="text-green-600 hover:text-green-700 flex items-center"
                          title="Edit KYC Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {submission.status === 'rejected' && (
                          <button
                            onClick={() => handleResubmitKYC(submission.id)}
                            disabled={processing === submission.id}
                            className="text-orange-600 hover:text-orange-700 flex items-center disabled:opacity-50"
                            title="Resubmit for Review"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No KYC submissions found</p>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">KYC Review</h2>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* User Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">User Name</p>
                        <p className="font-medium">{selectedSubmission.userName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedSubmission.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Full Name (as per document)</p>
                        <p className="font-medium">{selectedSubmission.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{selectedSubmission.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{selectedSubmission.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Document Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Document Type</p>
                        <p className="font-medium">
                          {documentTypes[selectedSubmission.documentType as keyof typeof documentTypes]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Document Number</p>
                        <p className="font-medium">{selectedSubmission.documentNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted At</p>
                        <p className="font-medium">{formatDate(selectedSubmission.submittedAt || '')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                          {getStatusIcon(selectedSubmission.status)}
                          <span className="ml-1 capitalize">{selectedSubmission.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Image */}
                {selectedSubmission.documentUrl && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Document Image</h3>
                      <a
                        href={selectedSubmission.documentUrl}
                        download={`kyc-${selectedSubmission.id}.jpg`}
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
                        src={selectedSubmission.documentUrl}
                        alt="KYC Document"
                        className="w-full h-auto max-h-96 object-contain cursor-pointer"
                        onClick={() => window.open(selectedSubmission.documentUrl, '_blank')}
                      />
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedSubmission.status === 'submitted' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a clear reason for rejection..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                      rows={3}
                    />
                  </div>
                )}

                {/* Actions */}
                {selectedSubmission.status === 'submitted' && (
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={() => updateKYCStatus(selectedSubmission.id, 'approved')}
                      disabled={processing === selectedSubmission.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve KYC
                    </button>
                    <button
                      onClick={() => {
                        if (!rejectionReason.trim()) {
                          alert('Please provide a rejection reason')
                          return
                        }
                        updateKYCStatus(selectedSubmission.id, 'rejected', rejectionReason)
                      }}
                      disabled={processing === selectedSubmission.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject KYC
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit KYC Modal */}
        {showEditModal && editingSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Edit KYC Details</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingSubmission(null)
                      setEditFormData({})
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editFormData.dateOfBirth || ''}
                      onChange={(e) => setEditFormData({...editFormData, dateOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={editFormData.address || ''}
                      onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Type
                    </label>
                    <select
                      value={editFormData.documentType || ''}
                      onChange={(e) => setEditFormData({...editFormData, documentType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(documentTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.documentNumber || ''}
                      onChange={(e) => setEditFormData({...editFormData, documentNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingSubmission(null)
                      setEditFormData({})
                    }}
                    disabled={processing === editingSubmission.id}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={processing === editingSubmission.id}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {processing === editingSubmission.id ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}