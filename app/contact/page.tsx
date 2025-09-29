'use client'

import { useState } from 'react'
import { useAuth } from '../components/FirebaseProvider'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Notification from '../components/Notification'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, User, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const { user } = useAuth()
  const [contactType, setContactType] = useState<'guest' | 'user' | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        subject: formData.subject,
        message: formData.message,
        timestamp: serverTimestamp(),
        source: contactType === 'user' ? 'authenticated_user' : 'guest_contact',
        userId: user?.uid || null,
        userAgent: navigator.userAgent,
        url: window.location.href,
        submittedAt: new Date().toISOString(),
        status: 'new',
        createdAt: new Date(),
        priority: contactType === 'user' ? 'high' : 'normal',
        expectedResponseTime: contactType === 'user' ? '6 hours' : '48 hours'
      }

      console.log('Submitting contact form:', submissionData)
      
      const docRef = await addDoc(collection(db, 'contact_submissions'), submissionData)
      
      console.log('Contact form submitted successfully with ID:', docRef.id)

      // Create a query for both authenticated and guest users
      const queryType = contactType === 'user' ? 'priority' : 'general'
      
      await addDoc(collection(db, 'queries'), {
        userId: user?.uid || null,
        userEmail: formData.email,
        userName: formData.name,
        subject: formData.subject,
        type: queryType,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [{
          sender: 'user',
          message: formData.message,
          timestamp: new Date(),
          createdAt: new Date().toISOString()
        }]
      })

      setSuccess(true)
      const responseTime = contactType === 'user' ? '6 hours' : '48 hours'
      setNotification({
        type: 'success',
        message: `Thank you! Your message has been sent successfully. We will contact you within ${responseTime}.`
      })
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error: any) {
      console.error('Error submitting contact form:', error)
      setNotification({
        type: 'error',
        message: `Failed to send message: ${error.message}. Please try again or call us directly.`
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Message Sent Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for contacting us. We will get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="bg-nitionz-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-5">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our investment plans? We're here to help you make informed decisions about your financial future.
            </p>
          </div>

          {/* Contact Type Selection */}
          {!contactType && (
            <div className="max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How would you like to contact us?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div 
                  onClick={() => setContactType('guest')}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-nitionz-blue"
                >
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">General Inquiry</h3>
                    <p className="text-gray-600 mb-4">For general questions and information</p>
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Response within 48 hours
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => user ? setContactType('user') : (window.location.href = '/auth/login')}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-nitionz-blue"
                >
                  <div className="text-center">
                    <User className="w-12 h-12 text-nitionz-blue mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {user ? 'Priority Support' : 'Login for Priority Support'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {user ? 'For account-related queries' : 'Sign in to get faster support'}
                    </p>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Response within 6 hours
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {contactType && (
            <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Send us a Message</h2>
                <button
                  onClick={() => setContactType(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Change Contact Type
                </button>
              </div>
              
              {contactType === 'user' && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Priority Support</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    As a registered user, you'll receive priority support with response within 6 hours.
                  </p>
                </div>
              )}
              
              {contactType === 'guest' && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">General Inquiry</span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    We'll respond to your inquiry within 48 hours during business days.
                  </p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={user && contactType === 'user' ? user.displayName || '' : formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                      placeholder="Enter your full name"
                      disabled={!!user && contactType === 'user'}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={user && contactType === 'user' ? user.email || '' : formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                      placeholder="Enter your email"
                      disabled={!!user && contactType === 'user'}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                      required
                    >
                      <option value="">Select a subject</option>
                      {contactType === 'user' ? (
                        <>
                          <option value="Account Support">Account Support</option>
                          <option value="Investment Inquiry">Investment Inquiry</option>
                          <option value="KYC Assistance">KYC Assistance</option>
                          <option value="Payment Issue">Payment Issue</option>
                          <option value="Technical Support">Technical Support</option>
                          <option value="Other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Investment Information">Investment Information</option>
                          <option value="Company Information">Company Information</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nitionz-blue focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-nitionz-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-nitionz-blue/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-nitionz-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Email Address</h3>
                      <p className="text-gray-600">support@nitionzpvtltd.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-nitionz-orange/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-nitionz-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Phone Number</h3>
                      <p className="text-gray-600">+91-7023555429</p>
                      <p className="text-sm text-gray-500">Mon-Sat, 10:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-nitionz-teal/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-nitionz-teal" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Office Address</h3>
                      <p className="text-gray-600">
                        NITIONZ, RAMPURA, CHITALWANA,<br />
                        SANCHORE, JALORE, 343041
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Hours</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Monday - Saturday</span>
                    <span className="font-semibold text-gray-800">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold text-red-600">Closed</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-nitionz-blue" />
                    <div>
                      <p className="font-semibold text-gray-800">Need urgent assistance?</p>
                      <p className="text-sm text-gray-600">Email us anytime for priority support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            )}
        </div>
      </main>

      <Footer />
      
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  )
}