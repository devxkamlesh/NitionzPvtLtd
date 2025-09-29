'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/FirebaseProvider'
import DashboardLayout from '../../components/DashboardLayout'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react'

interface UserSettings {
  name: string
  email: string
  phone: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy: {
    profileVisible: boolean
    shareData: boolean
  }
}

interface KYCStatus {
  status: 'not_submitted' | 'submitted' | 'approved' | 'rejected'
  rejectionReason?: string
  submittedAt?: string
  reviewedAt?: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null)
  
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    phone: '',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      profileVisible: true,
      shareData: false
    }
  })

  useEffect(() => {
    if (user) {
      loadUserSettings()
      loadKYCStatus()
    }
  }, [user])

  const loadUserSettings = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user!.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setSettings({
          name: userData.name || user!.displayName || '',
          email: userData.email || user!.email || '',
          phone: userData.phone || '',
          notifications: userData.notifications || {
            email: true,
            sms: false,
            push: true
          },
          privacy: userData.privacy || {
            profileVisible: true,
            shareData: false
          }
        })
      } else {
        // Set default values from user auth
        setSettings(prev => ({
          ...prev,
          name: user!.displayName || '',
          email: user!.email || ''
        }))
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadKYCStatus = async () => {
    try {
      const kycDoc = await getDoc(doc(db, 'kyc', user!.uid))
      if (kycDoc.exists()) {
        setKycStatus(kycDoc.data() as KYCStatus)
      } else {
        setKycStatus({ status: 'not_submitted' })
      }
    } catch (error) {
      console.error('Error loading KYC status:', error)
      setKycStatus({ status: 'not_submitted' })
    }
  }

  const handleInputChange = (field: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: keyof UserSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] as any,
        [field]: value
      }
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        name: settings.name,
        phone: settings.phone,
        notifications: settings.notifications,
        privacy: settings.privacy,
        updatedAt: new Date()
      })
      
      setMessage('Settings saved successfully!')
      setMessageType('success')
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Failed to save settings. Please try again.')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200'
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
      case 'submitted': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getKYCStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Verified'
      case 'rejected': return 'Rejected'
      case 'submitted': return 'Under Review'
      default: return 'Not Submitted'
    }
  }

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />
      case 'rejected': return <AlertCircle className="w-5 h-5" />
      case 'submitted': return <Eye className="w-5 h-5" />
      default: return <EyeOff className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nitionz-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
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

        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-nitionz-blue to-blue-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                <p className="text-blue-100">
                  Manage your account preferences and security settings
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* KYC Status Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-nitionz-blue mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">KYC Verification</h2>
            </div>
            
            <div className={`p-4 rounded-lg border ${getKYCStatusColor(kycStatus?.status || 'not_submitted')}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getKYCStatusIcon(kycStatus?.status || 'not_submitted')}
                  <div>
                    <p className="font-medium">
                      Status: {getKYCStatusText(kycStatus?.status || 'not_submitted')}
                    </p>
                    {kycStatus?.submittedAt && (
                      <p className="text-sm opacity-75">
                        Submitted: {new Date(kycStatus.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                {kycStatus?.status !== 'approved' && (
                  <a
                    href="/dashboard/kyc"
                    className="bg-nitionz-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {kycStatus?.status === 'rejected' ? 'Resubmit KYC' : 
                     kycStatus?.status === 'submitted' ? 'View Status' : 'Complete KYC'}
                  </a>
                )}
              </div>
              
              {kycStatus?.status === 'rejected' && kycStatus.rejectionReason && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-sm">
                    <strong>Rejection Reason:</strong> {kycStatus.rejectionReason}
                  </p>
                </div>
              )}
              
              {kycStatus?.status === 'approved' && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm">
                    ✅ Your identity has been verified. You can now invest in all available plans.
                  </p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-nitionz-blue mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <Bell className="w-6 h-6 text-nitionz-blue mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates about your investments via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => handleNestedChange('notifications', 'email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nitionz-blue"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-600">Receive important alerts via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={(e) => handleNestedChange('notifications', 'sms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nitionz-blue"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Receive real-time notifications in your browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => handleNestedChange('notifications', 'push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nitionz-blue"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-nitionz-blue mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                    <p className="text-sm text-gray-600">Allow others to see your profile information</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.profileVisible}
                      onChange={(e) => handleNestedChange('privacy', 'profileVisible', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nitionz-blue"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Data Sharing</h3>
                    <p className="text-sm text-gray-600">Allow us to share anonymized data for analytics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.shareData}
                      onChange={(e) => handleNestedChange('privacy', 'shareData', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nitionz-blue"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-nitionz-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}