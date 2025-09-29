'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../../lib/firebase'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // Phone number validation (basic)
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number')
      setLoading(false)
      return
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Update user profile
      await updateProfile(user, {
        displayName: formData.name
      })

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date(),
        adminReviewed: false,
        kyc: {
          status: 'not_submitted',
          docs: [],
          submittedAt: null,
          reviewedAt: null,
          reviewedBy: null,
          comment: ''
        },
        role: 'user'
      })

      setSuccess('Account created successfully! Redirecting to dashboard...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      let errorMessage = 'An error occurred during registration'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        case 'auth/weak-password':
          errorMessage = 'Password is too weak'
          break
        default:
          errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user document already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (userDoc.exists()) {
        // User already exists, redirect to dashboard
        setSuccess('Welcome back! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        // Create new user document
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || 'Google User',
          email: user.email || '',
          phone: '', // Will need to be filled later in profile
          createdAt: new Date(),
          adminReviewed: false,
          kyc: {
            status: 'not_submitted',
            docs: [],
            submittedAt: null,
            reviewedAt: null,
            reviewedBy: null,
            comment: ''
          },
          role: 'user',
          authProvider: 'google'
        })

        setSuccess('Account created successfully! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred during Google sign-up'
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-up cancelled'
          break
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked. Please allow popups and try again'
          break
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method'
          break
        default:
          errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
              <p className="text-gray-600">Join Nitionz for secure investments</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-nitionz-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign-Up Button */}
            <button
              onClick={handleGoogleSignUp}
              disabled={loading || googleLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>{googleLoading ? 'Creating account...' : 'Continue with Google'}</span>
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-nitionz-blue hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}