'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './FirebaseProvider'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  Shield,
  FileText,
  Users,
  TrendingUp,
  Database,
  MessageSquare
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import { AdminNotificationDropdown } from './AdminNotificationBadge'
import FeedbackModal from './FeedbackModal'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Check user status (banned, suspended, etc.)
    const checkUserStatus = async () => {
      if (user) {
        try {
          const response = await fetch('/api/user/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid })
          })
          const result = await response.json()
          if (result.success) {
            if (result.status === 'banned' || result.status === 'suspended') {
              await signOut(auth)
              router.push('/auth/banned')
            }
          }
        } catch (error) {
          console.error('Error checking user status:', error)
        }
      }
    }

    if (user && !loading) {
      checkUserStatus()
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const userNavigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/dashboard/portfolio', icon: TrendingUp },
    { name: 'KYC Verification', href: '/dashboard/kyc', icon: Shield },
    { name: 'My Plans', href: '/dashboard/plans', icon: CreditCard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Investment Plans', href: '/admin/investment-plans', icon: TrendingUp },
    { name: 'KYC Management', href: '/admin/kyc-management', icon: Shield },
    { name: 'Orders & Payments', href: '/admin/orders', icon: FileText },
    { name: 'User Queries', href: '/admin/queries', icon: MessageSquare },
    { name: 'User Feedback', href: '/admin/feedback', icon: MessageSquare },
    { name: 'Bank Details', href: '/admin/bank-details', icon: CreditCard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Database },
  ]

  const isAdmin = user?.email === 'admin@nitionzpvtltd.com'
  
  // Only show admin navigation if user is actually admin AND on admin pages
  const navigation = (pathname?.startsWith('/admin') && isAdmin) ? adminNavigation : userNavigation

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nitionz-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-30 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center">
              <Image 
                src="/img/nitinz-logo.webp" 
                alt="Nitionz Logo" 
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-nitionz-blue to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-nitionz-blue text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Admin/User Switch */}
          {isAdmin && (
            <div className="p-4 border-t border-gray-200">
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                    !pathname?.startsWith('/admin')
                      ? 'bg-blue-50 text-nitionz-blue'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>User View</span>
                </Link>
                <Link
                  href="/admin"
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                    pathname?.startsWith('/admin')
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                  </h1>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">
                    BETA
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {pathname?.startsWith('/admin') ? 'Admin Panel' : 'Welcome back!'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAdmin && pathname?.startsWith('/admin') ? (
                <AdminNotificationDropdown />
              ) : (
                <NotificationBell />
              )}
              
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Feedback</span>
              </button>
              
              <Link 
                href="/"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-nitionz-blue to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Website</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />
    </div>
  )
}