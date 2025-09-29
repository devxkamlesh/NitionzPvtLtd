'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { Upload, FileText, CheckCircle, AlertCircle, Camera, X, Calendar, User, Clock, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface KYCData {
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

const documentTypes = [
  { value: 'aadhaar', label: 'Aadhaar Card', description: 'Government issued ID card' },
  { value: 'pan', label: 'PAN Card', description: 'Permanent Account Number' },
  { value: 'passport', label: 'Passport', description: 'International travel document' },
  { value: 'driving_license', label: 'Driving License', description: 'Government issued license' },
  { value: 'voter_id', label: 'Voter ID', description: 'Election commission ID' }
]

export default function KYCPage() {
  const [user] = useAuthState(auth)
  const [kycData, setKycData] = useState<KYCData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    fullName: '',
    dateOfBirth: '',
    address: '',
    documentFile: null as File | null
  })

  useEffect(() => {
    if (user) {
      fetchKYCData()
    }
  }, [user])

  const fetchKYCData = async () => {
    try {
      const kycDoc = await getDoc(doc(db, 'kyc', user!.uid))
      if (kycDoc.exists()) {
        setKycData(kycDoc.data() as KYCData)
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image (JPEG, PNG, WebP) or PDF file')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 5MB')
      return
    }

    setFormData(prev => ({ ...prev, documentFile: file }))
    setError('')

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl('')
    }
  }

  const uploadDocument = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Upload failed')
    }

    return result.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.documentFile) return

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Upload document
      setUploading(true)
      const documentUrl = await uploadDocument(formData.documentFile)
      setUploading(false)

      // Save KYC data
      const kycData: KYCData = {
        status: 'submitted',
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        documentUrl,
        submittedAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'kyc', user.uid), kycData)
      
      setKycData(kycData)
      setSuccess('KYC documents submitted successfully! We will review your documents within 24-48 hours.')
      
      // Reset form
      setFormData({
        documentType: '',
        documentNumber: '',
        fullName: '',
        dateOfBirth: '',
        address: '',
        documentFile: null
      })
      setPreviewUrl('')

    } catch (error: any) {
      console.error('KYC submission error:', error)
      setUploading(false)
      
      // Better error handling
      let errorMessage = 'Failed to submit KYC documents. Please try again.'
      
      if (error.message?.includes('Invalid cloud_name')) {
        errorMessage = 'Image upload service is temporarily unavailable. Please try again later or contact support.'
      } else if (error.message?.includes('Failed to upload')) {
        errorMessage = 'Failed to upload document. Please check your internet connection and try again.'
      } else if (error.message?.includes('File size')) {
        errorMessage = 'File size is too large. Please use a file smaller than 5MB.'
      } else if (error.message?.includes('Invalid file type')) {
        errorMessage = 'Invalid file type. Please use JPEG, PNG, WebP, or PDF files only.'
      }
      
      setError(errorMessage)
    } finally {
      setSubmitting(false)
      setUploading(false)
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
      case 'approved': return <CheckCircle className="w-5 h-5" />
      case 'rejected': return <AlertCircle className="w-5 h-5" />
      case 'submitted': return <Upload className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nitionz-blue"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-nitionz-blue to-blue-600 rounded-xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
            <p className="text-blue-100 text-lg">
              Secure your account with identity verification
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="mt-8 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              kycData ? 'bg-white text-nitionz-blue' : 'bg-white/20 text-white'
            }`}>
              1
            </div>
            <span className="text-blue-100">Submit Documents</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/20"></div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              kycData?.status === 'submitted' || kycData?.status === 'approved' ? 'bg-white text-nitionz-blue' : 'bg-white/20 text-white'
            }`}>
              2
            </div>
            <span className="text-blue-100">Review Process</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/20"></div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              kycData?.status === 'approved' ? 'bg-white text-nitionz-blue' : 'bg-white/20 text-white'
            }`}>
              3
            </div>
            <span className="text-blue-100">Verification Complete</span>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {kycData && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Current Status</h2>
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(kycData.status)}`}>
              {getStatusIcon(kycData.status)}
              <span className="capitalize">{kycData.status.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <p className="text-sm font-medium text-gray-500">Document Type</p>
              </div>
              <p className="font-semibold text-gray-900">
                {documentTypes.find(d => d.value === kycData.documentType)?.label}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <p className="text-sm font-medium text-gray-500">Submitted On</p>
              </div>
              <p className="font-semibold text-gray-900">
                {kycData.submittedAt ? new Date(kycData.submittedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <User className="w-5 h-5 text-gray-500" />
                <p className="text-sm font-medium text-gray-500">Full Name</p>
              </div>
              <p className="font-semibold text-gray-900">{kycData.fullName}</p>
            </div>
          </div>

          {kycData.status === 'rejected' && kycData.rejectionReason && (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Application Rejected</h3>
                  <p className="text-red-700">{kycData.rejectionReason}</p>
                  <p className="text-sm text-red-600 mt-2">Please resubmit your documents with the required corrections.</p>
                </div>
              </div>
            </div>
          )}

          {kycData.status === 'submitted' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <div className="flex items-start space-x-3">
                <Clock className="w-6 h-6 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Under Review</h3>
                  <p className="text-yellow-700">Your documents are being reviewed by our team.</p>
                  <p className="text-sm text-yellow-600 mt-2">This process typically takes 24-48 hours.</p>
                </div>
              </div>
            </div>
          )}

          {kycData.status === 'approved' && (
            <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Verification Complete!</h3>
                  <p className="text-green-700">Your KYC verification has been approved successfully.</p>
                  <p className="text-sm text-green-600 mt-2">You can now start investing with full access to all features.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KYC Form */}
      {(!kycData || kycData.status === 'rejected') && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-nitionz-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-nitionz-blue" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {kycData?.status === 'rejected' ? 'Resubmit KYC Documents' : 'Submit KYC Documents'}
            </h2>
            <p className="text-gray-600">
              Please provide accurate information as per your government-issued document
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Document Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documentTypes.map((doc) => (
                  <label
                    key={doc.value}
                    className={`relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      formData.documentType === doc.value
                        ? 'border-nitionz-blue bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="documentType"
                      value={doc.value}
                      checked={formData.documentType === doc.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{doc.label}</p>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name (as per document) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.documentNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                  placeholder="Enter document number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address (as per document) *
              </label>
              <textarea
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                placeholder="Enter your complete address"
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Document *
              </label>
              <div className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
                formData.documentFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-nitionz-blue'
              }`}>
                {!formData.documentFile ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Upload Your Document
                    </h3>
                    <p className="text-gray-600 mb-1">
                      Take a clear photo or upload a scan of your document
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Supported: JPEG, PNG, WebP, PDF • Max size: 5MB
                    </p>
                    
                    <div className="space-y-3">
                      <label className="inline-flex items-center px-6 py-3 bg-nitionz-blue text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Clear & Readable</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>All Corners Visible</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>No Glare</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{formData.documentFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(formData.documentFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, documentFile: null }))
                          setPreviewUrl('')
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {previewUrl && (
                      <div className="relative w-full max-w-lg mx-auto">
                        <Image
                          src={previewUrl}
                          alt="Document preview"
                          width={500}
                          height={350}
                          className="rounded-lg border shadow-sm w-full h-auto"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Ready to submit
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || uploading || !formData.documentFile}
                className="px-6 py-3 bg-nitionz-blue text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit KYC Documents</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure your document is clear and all details are visible</li>
          <li>• Document should not be expired</li>
          <li>• Information entered must match exactly with the document</li>
          <li>• KYC verification typically takes 24-48 hours</li>
          <li>• You will be notified via email once verification is complete</li>
        </ul>
      </div>
    </div>
  )
}