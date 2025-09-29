'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, LogOut, User, Bell, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from './FirebaseProvider'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Don't show header on dashboard pages
  const isDashboardPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
      setShowUserMenu(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isDashboardPage) {
    return null // Don't render header on dashboard pages
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/investment-plans', label: 'Investment Plans' },
    { href: '/contact', label: 'Contact' },
    { href: '/legal', label: 'Legal' }
  ]

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-nitionz-blue text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>
      
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="relative flex items-center">
                <Image 
                  src="/img/nitinz-logo.webp" 
                  alt="Nitionz Pvt Ltd Logo" 
                  width={48}
                  height={48}
                  className="h-12 w-12 lg:h-14 lg:w-14 transition-transform group-hover:scale-105 object-contain"
                  priority
                  quality={100}
                />
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                    pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                      ? 'text-nitionz-blue bg-blue-50 shadow-sm' 
                      : 'text-gray-700 hover:text-nitionz-blue hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-3">
              {!loading && (
                user ? (
                  <div className="flex items-center space-x-3">
                    {/* Notifications - Hidden on mobile */}
                    <button className="hidden sm:flex p-2 text-gray-600 hover:text-nitionz-blue hover:bg-gray-100 rounded-lg transition-colors relative">
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {/* User Menu */}
                    <div className="relative user-menu-container">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-nitionz-blue to-blue-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 lg:w-4 lg:h-4" />
                        </div>
                        <span className="hidden sm:block font-medium text-sm">
                          {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2 animate-in slide-in-from-top-2 duration-200">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || user.email?.split('@')[0] || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          
                          <div className="py-2">
                            <Link 
                              href="/dashboard" 
                              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User className="w-4 h-4" />
                              <span>Dashboard</span>
                            </Link>
                            
                            <Link 
                              href="/dashboard/settings" 
                              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </Link>
                          </div>
                          
                          <div className="border-t border-gray-100 pt-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <Link 
                      href="/auth/login" 
                      className="text-gray-700 hover:text-nitionz-blue px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-colors font-medium text-sm"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/register" 
                      className="bg-gradient-to-r from-nitionz-blue to-blue-600 text-white px-4 py-2 lg:px-6 lg:py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-md hover:shadow-lg text-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                )
              )}
              
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-nitionz-blue transition-colors"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 top-3' : 'top-1'
                  }`} />
                  <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 top-3 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`} />
                  <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 top-3' : 'top-5'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-30 transform transition-transform duration-300 lg:hidden shadow-2xl ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Image 
                src="/img/nitinz-logo.webp" 
                alt="Nitionz Logo" 
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                quality={100}
              />
            </div>
            <button
              onClick={closeMenu}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-6 py-6 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    ? 'text-nitionz-blue bg-blue-50' 
                    : 'text-gray-700 hover:text-nitionz-blue hover:bg-gray-50'
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-6">
            {!loading && (
              user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-nitionz-blue rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user.displayName || user.email?.split('@')[0] || 'User'}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-nitionz-blue hover:bg-gray-50 rounded-lg transition-colors" 
                      onClick={closeMenu}
                    >
                      <User className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link 
                    href="/auth/login" 
                    className="block w-full px-4 py-3 text-center text-gray-700 hover:text-nitionz-blue hover:bg-gray-50 rounded-lg font-medium transition-colors" 
                    onClick={closeMenu}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="block w-full px-4 py-3 text-center bg-gradient-to-r from-nitionz-blue to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md" 
                    onClick={closeMenu}
                  >
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  )
}