'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../lib/firebase'
import { collection, getDocs, doc, updateDoc, query, orderBy, arrayUnion } from 'firebase/firestore'
import { 
  MessageSquare, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User,
  Bot,
  Calendar,
  Filter,
  Send,
  X
} from 'lucide-react'
import { notifyQueryResponse } from '../../lib/notifications'
import DashboardLayout from '../../components/DashboardLayout'

interface Query {
  id: string
  userId: string
  userEmail: string
  userName: string
  subject: string
  type: 'general' | 'priority'
  status: 'open' | 'replied' | 'resolved'
  createdAt: any
  updatedAt?: any
  messages: Array<{
    sender: 'user' | 'admin'
    message: string
    timestamp: any
    createdAt: string
  }>
}

export default function AdminQueriesPage() {
  const [user] = useAuthState(auth)
  const [queries, setQueries] = useState<Query[]>([])
  const [filteredQueries, setFilteredQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [processing, setProcessing] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'replied' | 'resolved'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'general' | 'priority'>('all')

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      fetchQueries()
    } else if (user) {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let filtered = queries

    if (filter !== 'all') {
      filtered = filtered.filter(query => query.status === filter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(query => query.type === typeFilter)
    }

    // Sort priority queries first
    filtered.sort((a, b) => {
      if (a.type === 'priority' && b.type !== 'priority') return -1
      if (b.type === 'priority' && a.type !== 'priority') return 1
      return 0
    })

    setFilteredQueries(filtered)
  }, [queries, filter, typeFilter])

  const fetchQueries = async () => {
    try {
      const queriesQuery = query(collection(db, 'queries'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(queriesQuery)
      
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Query[]
      
      setQueries(records)
    } catch (error) {
      console.error('Error fetching queries:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedQuery || !newMessage.trim()) return

    setProcessing(selectedQuery.id)
    try {
      const newMessageObj = {
        sender: 'admin',
        message: newMessage,
        timestamp: new Date(),
        createdAt: new Date().toISOString()
      }

      await updateDoc(doc(db, 'queries', selectedQuery.id), {
        messages: arrayUnion(newMessageObj),
        updatedAt: new Date(),
        status: 'replied'
      })

      // Send notification to user
      await notifyQueryResponse(selectedQuery.userId, selectedQuery.subject, selectedQuery.type)

      setQueries(prev => prev.map(query => 
        query.id === selectedQuery.id 
          ? { 
              ...query, 
              messages: [...query.messages, newMessageObj as any],
              status: 'replied' as Query['status'],
              updatedAt: new Date()
            }
          : query
      ))

      setNewMessage('')
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Failed to send reply')
    } finally {
      setProcessing('')
    }
  }

  const updateStatus = async (queryId: string, status: 'resolved') => {
    setProcessing(queryId)
    try {
      await updateDoc(doc(db, 'queries', queryId), {
        status,
        updatedAt: new Date()
      })

      setQueries(prev => prev.map(query => 
        query.id === queryId 
          ? { ...query, status: status as Query['status'], updatedAt: new Date() }
          : query
      ))

      if (selectedQuery?.id === queryId) {
        setSelectedQuery(prev => prev ? { ...prev, status } : null)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setProcessing('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50'
      case 'replied': return 'text-green-600 bg-green-50'
      case 'resolved': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'priority': return 'text-red-600 bg-red-50'
      case 'general': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />
      case 'replied': return <CheckCircle className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleString()
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Queries Management</h1>
        <p className="text-gray-600">Respond to user queries and provide support</p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Query Types:</strong> Priority queries (from contact form users) allow back-and-forth conversation. 
                General queries receive one-time responses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Queries</p>
              <p className="text-2xl font-bold text-gray-900">{queries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Priority Queries</p>
              <p className="text-2xl font-bold text-gray-900">
                {queries.filter(q => q.type === 'priority').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Can reply back</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Open Queries</p>
              <p className="text-2xl font-bold text-gray-900">
                {queries.filter(q => q.status === 'open').length}
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
                {queries.filter(q => q.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex space-x-2">
                {(['all', 'open', 'replied', 'resolved'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex space-x-2">
                {(['all', 'priority', 'general'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      typeFilter === type
                        ? 'bg-nitionz-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Queries Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQueries.map((query) => (
                <tr key={query.id} className={`hover:bg-gray-50 relative ${
                  query.status === 'resolved' ? 'bg-green-50 opacity-75' : 
                  query.status === 'replied' ? 'bg-blue-50 opacity-75' : ''
                }`}>
                  {query.status === 'resolved' && (
                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{query.userName}</div>
                        <div className="text-sm text-gray-500">{query.subject}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(query.type)}`}>
                      {query.type === 'priority' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {query.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                      {getStatusIcon(query.status)}
                      <span className="ml-1 capitalize">{query.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(query.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedQuery(query)}
                      className="text-nitionz-blue hover:text-blue-700 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View & Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQueries.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No queries found</p>
          </div>
        )}
      </div>

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedQuery.subject}</h2>
                  <p className="text-gray-600">From: {selectedQuery.userName} ({selectedQuery.userEmail})</p>
                </div>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Messages */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {selectedQuery.messages?.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'admin'
                          ? 'bg-nitionz-blue text-white'
                          : 'bg-white text-gray-900 border'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {message.sender === 'admin' ? (
                            <Bot className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="text-xs opacity-75">
                            {message.sender === 'admin' ? 'You' : selectedQuery.userName}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {formatDate(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={sendReply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={processing === selectedQuery.id || !newMessage.trim()}
                    className="flex-1 bg-nitionz-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </button>
                  
                  {selectedQuery.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedQuery.id, 'resolved')}
                      disabled={processing === selectedQuery.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  )
}