'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../lib/firebase'
import DashboardLayout from '../../components/DashboardLayout'
import { 
  Users, 
  Eye, 
  Shield, 
  CreditCard, 
  MessageSquare,
  User,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Ban,
  UserCheck,
  MoreVertical
} from 'lucide-react'

interface UserRecord {
  id: string
  name: string
  email: string
  phone?: string
  kycStatus: 'not_submitted' | 'submitted' | 'approved' | 'rejected'
  totalInvested: number
  activeInvestments: number
  totalOrders: number
  joinedAt: any
  status?: 'active' | 'banned' | 'suspended'
}

export default function AdminUsersPage() {
  const [user] = useAuthState(auth)
  const [users, setUsers] = useState<UserRecord[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [kycFilter, setKycFilter] = useState<'all' | 'not_submitted' | 'submitted' | 'approved' | 'rejected' | 'unreviewed'>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      fetchUsers()
    } else if (user) {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let filtered = users

    if (kycFilter === 'unreviewed') {
      filtered = filtered.filter(user => !(user as any).adminReviewed)
    } else if (kycFilter !== 'all') {
      filtered = filtered.filter(user => user.kycStatus === kycFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, kycFilter, searchTerm])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const result = await response.json()
      
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      const result = await response.json()
      
      if (result.success) {
        setSelectedUser(result.data)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      case 'submitted': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'submitted': return <Clock className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const handleEditUser = (user: UserRecord) => {
    setEditingUser(user)
    setShowEditModal(true)
    setShowActionMenu(null)
  }

  const handleBanUser = async (userId: string, action: 'ban' | 'unban') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/users/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          action: action,
          status: action === 'ban' ? 'banned' : 'active'
        })
      })

      const result = await response.json()
      if (result.success) {
        fetchUsers() // Refresh the list
        alert(`User ${action}ned successfully`)
      } else {
        alert(`Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action}ning user:`, error)
      alert(`Failed to ${action} user`)
    } finally {
      setActionLoading(false)
      setShowActionMenu(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/users/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const result = await response.json()
      if (result.success) {
        fetchUsers() // Refresh the list
        alert('User deleted successfully')
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    } finally {
      setActionLoading(false)
      setShowActionMenu(null)
    }
  }

  const handleMarkAsReviewed = async (userId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/users/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          action: 'mark_reviewed',
          adminReviewed: true,
          reviewedAt: new Date().toISOString(),
          reviewedBy: user?.email
        })
      })

      const result = await response.json()
      if (result.success) {
        fetchUsers() // Refresh the list
        alert('User marked as reviewed successfully')
      } else {
        alert('Failed to mark user as reviewed')
      }
    } catch (error) {
      console.error('Error marking user as reviewed:', error)
      alert('Failed to mark user as reviewed')
    } finally {
      setActionLoading(false)
      setShowActionMenu(null)
    }
  }

  const handleUpdateUser = async (userData: any) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/users/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: editingUser?.id,
          userData
        })
      })

      const result = await response.json()
      if (result.success) {
        fetchUsers() // Refresh the list
        setShowEditModal(false)
        setEditingUser(null)
        alert('User updated successfully')
      } else {
        alert('Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    } finally {
      setActionLoading(false)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage users and view their investment activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">KYC Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.kycStatus === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">KYC Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.kycStatus === 'submitted').length}
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
                <p className="text-sm text-gray-500">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(users.reduce((sum, u) => sum + u.totalInvested, 0))}
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
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              {(['all', 'unreviewed', 'not_submitted', 'submitted', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setKycFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    kycFilter === status
                      ? 'bg-nitionz-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Users' : 
                   status === 'unreviewed' ? 'Need Review' :
                   status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userRecord) => (
                  <tr key={userRecord.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          {!(userRecord as any).adminReviewed && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">{userRecord.name}</div>
                            {!(userRecord as any).adminReviewed && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                New
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{userRecord.email}</div>
                          {userRecord.phone && (
                            <div className="text-sm text-gray-500">{userRecord.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKycStatusColor(userRecord.kycStatus)}`}>
                        {getKycStatusIcon(userRecord.kycStatus)}
                        <span className="ml-1 capitalize">{userRecord.kycStatus.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(userRecord.totalInvested)}</div>
                      <div className="text-sm text-gray-500">{userRecord.activeInvestments} active plans</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(userRecord.joinedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => fetchUserDetails(userRecord.id)}
                          className="text-nitionz-blue hover:text-blue-700 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        
                        <div className="relative">
                          <button
                            onClick={() => setShowActionMenu(showActionMenu === userRecord.id ? null : userRecord.id)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {showActionMenu === userRecord.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditUser(userRecord)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit User
                                </button>
                                
                                {!(userRecord as any).adminReviewed && (
                                  <button
                                    onClick={() => handleMarkAsReviewed(userRecord.id)}
                                    disabled={actionLoading}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left disabled:opacity-50"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark as Reviewed
                                  </button>
                                )}
                                
                                {userRecord.status !== 'banned' ? (
                                  <button
                                    onClick={() => handleBanUser(userRecord.id, 'ban')}
                                    disabled={actionLoading}
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left disabled:opacity-50"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Ban User
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBanUser(userRecord.id, 'unban')}
                                    disabled={actionLoading}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left disabled:opacity-50"
                                  >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Unban User
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleDeleteUser(userRecord.id)}
                                  disabled={actionLoading}
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* User Info */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedUser.user.name}</h3>
                        <p className="text-gray-600">{selectedUser.user.email}</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{selectedUser.user.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Joined</p>
                          <p className="font-medium">{formatDate(selectedUser.user.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">KYC Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKycStatusColor(selectedUser.kyc?.status || 'not_submitted')}`}>
                            {getKycStatusIcon(selectedUser.kyc?.status || 'not_submitted')}
                            <span className="ml-1 capitalize">{(selectedUser.kyc?.status || 'not_submitted').replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orders and Activity */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Investment Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{selectedUser.orders.length}</p>
                        <p className="text-sm text-blue-600">Total Orders</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(selectedUser.orders.filter((o: any) => o.status === 'paid').reduce((sum: number, o: any) => sum + o.amount, 0))}
                        </p>
                        <p className="text-sm text-green-600">Total Invested</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <MessageSquare className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-orange-900">{selectedUser.supportTickets.length}</p>
                        <p className="text-sm text-orange-600">Support Tickets</p>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h4>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        {selectedUser.orders.length > 0 ? (
                          <div className="divide-y divide-gray-200">
                            {selectedUser.orders.slice(0, 5).map((order: any) => (
                              <div key={order.id} className="p-4 flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{order.planName}</p>
                                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">{formatCurrency(order.amount)}</p>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No orders yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingUser(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  const userData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    status: formData.get('status')
                  }
                  handleUpdateUser(userData)
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingUser.name}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingUser.email}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={editingUser.phone || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={editingUser.status || 'active'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        setEditingUser(null)
                      }}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Updating...' : 'Update User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )

  function getStatusColor(status: string) {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'payment_uploaded': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
}