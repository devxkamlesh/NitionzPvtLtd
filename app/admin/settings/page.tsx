'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../lib/firebase'
import DashboardLayout from '../../components/DashboardLayout'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { 
  Settings, 
  Bell, 
  Users, 
  Clock, 
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface AdminSettings {
  userNotificationDays: number
  autoKycApproval: boolean
  maxInvestmentAmount: number
  minInvestmentAmount: number
  emailNotifications: boolean
  smsNotifications: boolean
}

export default function AdminSettingsPage() {
  const [user] = useAuthState(auth)
  const [settings, setSettings] = useState<AdminSettings>({
    userNotificationDays: 7,
    autoKycApproval: false,
    maxInvestmentAmount: 10000000,
    minInvestmentAmount: 100000,
    emailNotifications: true,
    smsNotifications: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (user?.email === 'admin@nitionzpvtltd.com') {
      fetchSettings()
    } else if (user) {
      setLoading(false)
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'adminSettings', 'notifications'))
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as AdminSettings
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await setDoc(doc(db, 'adminSettings', 'notifications'), {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email
      })

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof AdminSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
          <p className="text-gray-600">Configure system settings and notification preferences</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                <p className="text-gray-600">Configure how and when you receive notifications</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Notification Duration (Days)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.userNotificationDays}
                    onChange={(e) => handleInputChange('userNotificationDays', parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Show new user notifications for this many days after registration
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                    <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <p className="text-gray-600">Configure user registration and KYC settings</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto KYC Approval</label>
                  <p className="text-xs text-gray-500">Automatically approve KYC submissions (not recommended)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoKycApproval}
                    onChange={(e) => handleInputChange('autoKycApproval', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Investment Limits */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Investment Limits</h2>
                <p className="text-gray-600">Set minimum and maximum investment amounts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Investment Amount (₹)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={settings.minInvestmentAmount}
                  onChange={(e) => handleInputChange('minInvestmentAmount', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Investment Amount (₹)
                </label>
                <input
                  type="number"
                  min="100000"
                  step="100000"
                  value={settings.maxInvestmentAmount}
                  onChange={(e) => handleInputChange('maxInvestmentAmount', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}