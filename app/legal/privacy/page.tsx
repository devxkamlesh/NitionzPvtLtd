'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { Shield, Lock, Clock, Eye, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-nitionz-blue via-blue-700 to-blue-900 flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/90">Your privacy and data security are our priority</p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link 
              href="/legal" 
              className="inline-flex items-center space-x-2 text-nitionz-blue hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Legal Information</span>
            </Link>
          </div>
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-8 h-8 text-nitionz-blue" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Privacy Policy</h2>
                <p className="text-sm text-gray-600 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Last Updated: 27-08-2025</span>
                </p>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-6">
                At NITIONZ PRIVATE LIMITED, we value your trust. This Privacy Policy outlines how we collect, use, and protect your personal information.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">1. Information We Collect</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Name, Email, Phone Number, Address (during registration/payment).</li>
                <li>Payment details (processed securely via Razorpay/other gateways).</li>
                <li>Technical data (IP address, browser, device info).</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">2. How We Use Information</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>To activate and manage your investment plan.</li>
                <li>To send important updates, payment confirmations, and reminders.</li>
                <li>To comply with legal and regulatory requirements.</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">3. Data Protection</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>We do not store your card/banking details.</li>
                <li>Data is secured with SSL encryption and access restrictions.</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">4. Third-Party Sharing</h3>
              <p className="text-gray-700 mb-6">
                We only share information with trusted payment processors and regulatory authorities when required by law.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">5. Your Rights</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>You can request access to your personal data.</li>
                <li>You can request correction of inaccurate data.</li>
                <li>You can request deletion of your data (subject to legal requirements).</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">6. Contact Us</h3>
              <p className="text-gray-700">
                For any privacy-related queries, contact us at support@nitionzpvtltd.com
              </p>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">Data Security</h4>
                      <p className="text-green-700 text-sm">
                        Your data is protected with industry-standard encryption and security measures.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start space-x-3">
                    <Eye className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Transparency</h4>
                      <p className="text-blue-700 text-sm">
                        We believe in complete transparency about how your data is collected and used.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}