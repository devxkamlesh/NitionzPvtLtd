'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../lib/firebase'
import DashboardLayout from '../../components/DashboardLayout'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Percent,
  Eye,
  EyeOff
} from 'lucide-react'

interface InvestmentPlan {
  id: string
  name: string
  description: string
  minAmount: number
  maxAmount: number
  roiPercentage: number
  durationMonths: number
  isActive: boolean
  createdAt: any
  updatedAt?: any
}

export default function AdminInvestmentPlansPage() {
  const [user] = useAuthState(auth)
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    roiPercentage: '',
    durationMonths: '',
    isActive: true
  })

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      const unsubscribe = onSnapshot(collection(db, 'investmentPlans'), (snapshot) => {
        const plansData: InvestmentPlan[] = []
        snapshot.forEach((doc) => {
          plansData.push({ id: doc.id, ...doc.data() } as InvestmentPlan)
        })
        setPlans(plansData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
        setLoading(false)
      })

      return () => unsubscribe()
    } else if (user) {
      setLoading(false)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const planData = {
        name: formData.name,
        description: formData.description,
        minAmount: parseInt(formData.minAmount),
        maxAmount: parseInt(formData.maxAmount),
        roiPercentage: parseFloat(formData.roiPercentage),
        durationMonths: parseInt(formData.durationMonths),
        isActive: formData.isActive,
        updatedAt: serverTimestamp()
      }

      if (editingPlan) {
        await updateDoc(doc(db, 'investmentPlans', editingPlan.id), planData)
      } else {
        await addDoc(collection(db, 'investmentPlans'), {
          ...planData,
          createdAt: serverTimestamp()
        })
      }
      
      resetForm()
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Failed to save investment plan')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      minAmount: '',
      maxAmount: '',
      roiPercentage: '',
      durationMonths: '',
      isActive: true
    })
    setShowForm(false)
    setEditingPlan(null)
  }

  const handleEdit = (plan: InvestmentPlan) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      minAmount: plan.minAmount.toString(),
      maxAmount: plan.maxAmount.toString(),
      roiPercentage: plan.roiPercentage.toString(),
      durationMonths: plan.durationMonths.toString(),
      isActive: plan.isActive
    })
    setEditingPlan(plan)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this investment plan?')) {
      try {
        await deleteDoc(doc(db, 'investmentPlans', id))
      } catch (error) {
        console.error('Error deleting plan:', error)
        alert('Failed to delete investment plan')
      }
    }
  }

  const togglePlanStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'investmentPlans', id), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating plan status:', error)
      alert('Failed to update plan status')
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString()
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Plans</h1>
            <p className="text-gray-600">Create and manage investment plans for users</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-nitionz-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Plan</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Percent className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg ROI</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.length > 0 
                    ? `${(plans.reduce((sum, p) => sum + p.roiPercentage, 0) / plans.length).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.length > 0 
                    ? `${Math.round(plans.reduce((sum, p) => sum + p.durationMonths, 0) / plans.length)}m`
                    : '0m'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plan.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Investment Range</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(plan.minAmount)} - {formatCurrency(plan.maxAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ROI</span>
                  <span className="text-sm font-medium text-green-600">{plan.roiPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-medium">{plan.durationMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm font-medium">{formatDate(plan.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    plan.isActive 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {plan.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-full text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Investment Plans</h3>
              <p className="text-gray-500 mb-6">Create your first investment plan to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-nitionz-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Create Plan
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingPlan ? 'Edit Investment Plan' : 'Create New Investment Plan'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue"
                        placeholder="e.g., Premium Fixed Deposit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ROI Percentage
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.roiPercentage}
                        onChange={(e) => setFormData({...formData, roiPercentage: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue"
                        placeholder="e.g., 12.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Amount (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.minAmount}
                        onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue"
                        placeholder="e.g., 10000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Amount (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.maxAmount}
                        onChange={(e) => setFormData({...formData, maxAmount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue"
                        placeholder="e.g., 1000000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (Months)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.durationMonths}
                        onChange={(e) => setFormData({...formData, durationMonths: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue"
                        placeholder="e.g., 12"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Active Plan</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue"
                      rows={4}
                      placeholder="Describe the investment plan features and benefits..."
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-nitionz-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
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
}