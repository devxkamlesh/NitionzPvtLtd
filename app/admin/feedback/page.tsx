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
  orderBy,
  deleteDoc
} from 'firebase/firestore'
import { 
  MessageSquare, 
  Star, 
  Eye, 
  Trash2,
  Calendar,
  Search,
  Filter,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react'

interface Feedback {
  id: string
  userId: string
  userEmail: string
  userName: string
  feedback: string
  rating: number
  category: string
  status: 'new' | 'reviewed' | 'resolved'
  createdAt: any
  reviewedAt?: string
  adminNote?: string
}

const categoryLabels = {
  general: 'General Feedback',
  bug: 'Bug Report',
  feature: 'Feature Request',
  ui: 'User Interface',
  performance: 'Performance'
}

export default function AdminFeedbackPage() {
  const [user] = useAuthState(auth)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [processing, setProcessing] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const feedbackData: Feedback[] = []
        snapshot.forEach((doc) => {
          feedbackData.push({
            id: doc.id,
            ...doc.data()
          } as Feedback)
        })
        setFeedbacks(feedbackData)
        setLoading(false)
      })

      return () => unsubscribe()
    } else if (user) {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let filtered = feedbacks

    if (filter !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === filter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.category === categoryFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(feedback => 
        feedback.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.feedback?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredFeedbacks(filtered)
  }, [feedbacks, filter, categoryFilter, searchTerm])

  const updateFeedbackStatus = async (feedbackId: string, status: 'reviewed' | 'resolved') => {
    setProcessing(feedbackId)
    try {
      const updateData: any = {
        status,
        reviewedAt: new Date().toISOString()
      }

      if (adminNote.trim()) {
        updateData.adminNote = adminNote.trim()
      }

      await updateDoc(doc(db, 'feedback', feedbackId), updateData)
      
      setSelectedFeedback(null)
      setAdminNote('')
    } catch (error) {
      console.error('Error updating feedback status:', error)
      alert('Failed to update feedback status')
    } finally {
      setProcessing('')
    }
  }

  const deleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return

    setProcessing(feedbackId)
    try {
      await deleteDoc(doc(db, 'feedback', feedbackId))
      setSelectedFeedback(null)
    } catch (error) {
      console.error('Error deleting feedback:', error)
      alert('Failed to delete feedback')
    } finally {
      setProcessing('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'reviewed': return 'text-blue-600 bg-blue-50'
      case 'new': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      case 'reviewed': return <Eye className="w-4 h-4" />
      case 'new': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug': return 'text-red-600 bg-red-50'
      case 'feature': return 'text-purple-600 bg-purple-50'
      case 'ui': return 'text-blue-600 bg-blue-50'
      case 'performance': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleString()
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Feedback</h1>
          <p className="text-gray-600">Review and manage user feedback from the beta version</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">New Feedback</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feedbacks.filter(f => f.status === 'new').length}
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
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feedbacks.filter(f => f.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feedbacks.length > 0 
                    ? (feedbacks.filter(f => f.rating > 0).reduce((sum, f) => sum + f.rating, 0) / feedbacks.filter(f => f.rating > 0).length || 0).toFixed(1)
                    : '0.0'
                  }
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
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
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
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{feedback.userName}</div>
                          <div className="text-sm text-gray-500">{feedback.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(feedback.category)}`}>
                        {categoryLabels[feedback.category as keyof typeof categoryLabels]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feedback.rating > 0 ? renderStars(feedback.rating) : (
                        <span className="text-gray-400 text-sm">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {getStatusIcon(feedback.status)}
                        <span className="ml-1 capitalize">{feedback.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(feedback.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedFeedback(feedback)}
                          className="text-nitionz-blue hover:text-blue-700 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => deleteFeedback(feedback.id)}
                          disabled={processing === feedback.id}
                          className="text-red-600 hover:text-red-700 flex items-center disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFeedbacks.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No feedback found</p>
            </div>
          )}
        </div>

        {/* Feedback Details Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* User Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedFeedback.userName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedFeedback.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedFeedback.category)}`}>
                          {categoryLabels[selectedFeedback.category as keyof typeof categoryLabels]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        {selectedFeedback.rating > 0 ? renderStars(selectedFeedback.rating) : (
                          <span className="text-gray-400 text-sm">No rating provided</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800">{selectedFeedback.feedback}</p>
                    </div>
                  </div>

                  {/* Admin Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Note (Optional)
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add a note about this feedback..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  {selectedFeedback.status !== 'resolved' && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => updateFeedbackStatus(selectedFeedback.id, 'reviewed')}
                        disabled={processing === selectedFeedback.id}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Mark as Reviewed
                      </button>
                      <button
                        onClick={() => updateFeedbackStatus(selectedFeedback.id, 'resolved')}
                        disabled={processing === selectedFeedback.id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}