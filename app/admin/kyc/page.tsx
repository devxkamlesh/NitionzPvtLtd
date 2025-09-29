'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../lib/firebase'
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { CheckCircle, XCircle, Eye, Clock, FileText, User, Calendar } from 'lucide-react'
import { notifyKYCStatusChange } from '../../lib/notifications'
import Image from 'next/image'

interface KYCRecord {
  id: string
  userId: string
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
  userEmail?: string
}

const documentTypes = {
  'aadhaar': 'Aadhaar Card',
  'pan': 'PAN Card',
  'passport': 'Passport',
  'driving_license': 'Driving License',
  'voter_id': 'Voter ID'
}

export default function AdminKYCPage() {
  const [user] = useAuthState(auth)
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null)
  const [processing, setProcessing] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [filter, setFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      fetchKYCRecords()
    }
  }, [user])

  const fetchKYCRecords = async () => {
    try {
      const kycQuery = query(collection(db, 'kyc'), orderBy('submittedAt', 'desc'))
      const snapshot = await getDocs(kycQuery)
      
      const records: KYCRecord[] = []
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        
        // Get user email
        try {
          const userDoc = await getDocs(query(collection(db, 'users')))
          const userRecord = userDoc.docs.find(doc => doc.id === docSnap.id)
          const userEmail = userRecord?.data()?.email || 'Unknown'
          
          records.push({
            id: docSnap.id,
            userId: docSnap.id,
            userEmail,
            ...data
          } as KYCRecord)
        } catch (error) {
          records.push({
            id: docSnap.id,
            userId: docSnap.id,
            userEmail: 'Unknown',
            ...data
          } as KYCRecord)
        }
      }
      
      setKycRecords(records)
    } catch (error) {
      console.error('Error fetching KYC records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (recordId: string) => {
    setProcessing(recordId)
    try {
      await updateDoc(doc(db, 'kyc', recordId), {
        status: 'approved',
        reviewedAt: new Date().toISOString()
      })
      
      setKycRecords(prev => prev.map(record => 
        record.id === recordId 
          ? { ...record, status: 'approved', reviewedAt: new Date().toISOString() }
          : record
      ))
      
      // Send notification
      await notifyKYCStatusChange(recordId, 'approved')
      
      setSelectedRecord(null)
    } catch (error) {
      console.error('Error approving KYC:', error)
    } finally {
      setProcessing('')
    }
  }

  const handleReject = async (recordId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setProcessing(recordId)
    try {
      await updateDoc(doc(db, 'kyc', recordId), {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        rejectionReason: rejectionReason.trim()
      })
      
      setKycRecords(prev => prev.map(record => 
        record.id === recordId 
          ? { 
              ...record, 
              status: 'rejected', 
              reviewedAt: new Date().toISOString(),
              rejectionReason: rejectionReason.trim()
            }
          : record
      ))
      
      // Send notification
      await notifyKYCStatusChange(recordId, 'rejected', rejectionReason.trim())
      
      setSelectedRecord(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting KYC:', error)
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

  const filteredRecords = kycRecords.filter(record => 
    filter === 'all' || record.status === filter
  )

  if (!user || user?.email !== 'admin@nitionzpvtltd.com') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nitionz-blue"></div>
      </div>
    )
  }

  return (
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
              <p className="text-2xl font-bold text-gray-900">{kycRecords.length}</p>
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
                {kycRecords.filter(r => r.status === 'submitted').length}
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
                {kycRecords.filter(r => r.status === 'approved').length}
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
                {kycRecords.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
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
              {status === 'all' ? 'All Records' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KYC Records */}
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
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.fullName}</div>
                        <div className="text-sm text-gray-500">{record.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {documentTypes[record.documentType as keyof typeof documentTypes]}
                    </div>
                    <div className="text-sm text-gray-500">{record.documentNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1 capitalize">{record.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedRecord(record)}
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

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No KYC records found</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">KYC Review</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{selectedRecord.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedRecord.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{selectedRecord.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{selectedRecord.address}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Document Type</p>
                        <p className="font-medium">
                          {documentTypes[selectedRecord.documentType as keyof typeof documentTypes]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Document Number</p>
                        <p className="font-medium">{selectedRecord.documentNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted On</p>
                        <p className="font-medium">
                          {selectedRecord.submittedAt ? new Date(selectedRecord.submittedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Image */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Document</h3>
                  {selectedRecord.documentUrl ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Image
                        src={selectedRecord.documentUrl}
                        alt="KYC Document"
                        width={500}
                        height={400}
                        className="w-full h-auto"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No document uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedRecord.status === 'submitted' && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleApprove(selectedRecord.id)}
                      disabled={processing === selectedRecord.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve KYC
                    </button>
                    
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows={2}
                      />
                      <button
                        onClick={() => handleReject(selectedRecord.id)}
                        disabled={processing === selectedRecord.id || !rejectionReason.trim()}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject KYC
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedRecord.status === 'rejected' && selectedRecord.rejectionReason && (
                <div className="mt-8 pt-6 border-t">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">
                      <strong>Rejection Reason:</strong> {selectedRecord.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}