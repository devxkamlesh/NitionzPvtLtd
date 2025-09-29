'use client'

import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Plus, Edit, Trash2, Building, CreditCard } from 'lucide-react'

interface BankDetail {
  id: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  ifscCode: string
  branchName: string
  upiId?: string
  upiEnabled: boolean
  isDefault: boolean
  isActive: boolean
  createdAt: any
}

import DashboardLayout from '../../components/DashboardLayout'

export default function BankDetailsPage() {
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingBank, setEditingBank] = useState<BankDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    branchName: '',
    upiId: '',
    upiEnabled: true,
    isDefault: false,
    isActive: true
  })

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bankDetails'), (snapshot) => {
      const banks: BankDetail[] = []
      snapshot.forEach((doc) => {
        banks.push({ id: doc.id, ...doc.data() } as BankDetail)
      })
      setBankDetails(banks.sort((a, b) => b.isDefault ? 1 : -1))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingBank) {
        await updateDoc(doc(db, 'bankDetails', editingBank.id), {
          ...formData,
          updatedAt: new Date()
        })
      } else {
        // If setting as default, remove default from others
        if (formData.isDefault) {
          const defaultBanks = bankDetails.filter(bank => bank.isDefault)
          for (const bank of defaultBanks) {
            await updateDoc(doc(db, 'bankDetails', bank.id), { isDefault: false })
          }
        }
        
        await addDoc(collection(db, 'bankDetails'), {
          ...formData,
          createdAt: new Date()
        })
      }
      
      resetForm()
    } catch (error) {
      console.error('Error saving bank details:', error)
      alert('Failed to save bank details')
    }
  }

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      branchName: '',
      upiId: '',
      upiEnabled: true,
      isDefault: false,
      isActive: true
    })
    setShowForm(false)
    setEditingBank(null)
  }

  const handleEdit = (bank: BankDetail) => {
    setFormData({
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountHolderName: bank.accountHolderName,
      ifscCode: bank.ifscCode,
      branchName: bank.branchName,
      upiId: bank.upiId || '',
      upiEnabled: bank.upiEnabled ?? true,
      isDefault: bank.isDefault,
      isActive: bank.isActive
    })
    setEditingBank(bank)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      try {
        await deleteDoc(doc(db, 'bankDetails', id))
      } catch (error) {
        console.error('Error deleting bank details:', error)
        alert('Failed to delete bank details')
      }
    }
  }

  const setAsDefault = async (id: string) => {
    try {
      // Remove default from all banks
      for (const bank of bankDetails) {
        await updateDoc(doc(db, 'bankDetails', bank.id), { isDefault: false })
      }
      // Set selected as default
      await updateDoc(doc(db, 'bankDetails', id), { isDefault: true })
    } catch (error) {
      console.error('Error setting default bank:', error)
      alert('Failed to set default bank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Account Management</h1>
          <p className="text-gray-600">Manage bank accounts for user payments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bank Account</span>
        </button>
      </div>

      {/* Bank Details Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {bankDetails.map((bank) => (
          <div key={bank.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{bank.bankName}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {bank.isDefault && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  bank.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {bank.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-sm text-gray-500">Account Holder</p>
                <p className="font-medium">{bank.accountHolderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-mono">****{bank.accountNumber.slice(-4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IFSC Code</p>
                <p className="font-mono">{bank.ifscCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Branch</p>
                <p>{bank.branchName}</p>
              </div>
              {bank.upiId && (
                <div>
                  <p className="text-sm text-gray-500">UPI ID</p>
                  <p className="font-mono">{bank.upiId}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    bank.upiEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    UPI {bank.upiEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(bank)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(bank.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {!bank.isDefault && (
                <button
                  onClick={() => setAsDefault(bank.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.branchName}
                  onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., nitionz@paytm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    className="mr-2"
                  />
                  Set as Default
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  Active
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.upiEnabled}
                    onChange={(e) => setFormData({...formData, upiEnabled: e.target.checked})}
                    className="mr-2"
                  />
                  UPI Enabled
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingBank ? 'Update' : 'Add'} Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  )
}