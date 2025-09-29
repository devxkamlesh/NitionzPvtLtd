'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { RefreshCw, Clock, AlertTriangle, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react'

export default function RefundPage() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-nitionz-blue via-blue-700 to-blue-900 flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Refund & Cancellation Policy</h1>
            <p className="text-xl text-white/90">Clear and transparent refund guidelines</p>
          </div>
        </div>
      </section>

      {/* Refund Content */}
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
              <RefreshCw className="w-8 h-8 text-nitionz-blue" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Refund & Cancellation Policy</h2>
                <p className="text-sm text-gray-600 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Last Updated: 27-08-2025</span>
                </p>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <div className="mb-8 p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Important Notice</h4>
                    <p className="text-red-700 text-sm">
                      Payments once made towards any investment plan are non-refundable. Please read this policy carefully before making any investment.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4">Refund Policy</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li><strong>Payments once made towards any investment plan are non-refundable.</strong></li>
                <li>In case of duplicate/failed transactions, please contact us at support@nitionzpvtltd.com within 7 calendar days.</li>
                <li>If approved, refunds will be processed back to the original payment method within 7–10 business days.</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">Cancellation Policy</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li><strong>Once a plan is purchased and activated, cancellation is not permitted.</strong></li>
                <li>Users are advised to carefully review plan details before confirming payment.</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">Exceptional Circumstances</h3>
              <p className="text-gray-700 mb-6">
                Refunds may be considered in exceptional circumstances such as:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Technical errors on our platform leading to incorrect charges</li>
                <li>Duplicate payments due to system malfunction</li>
                <li>Unauthorized transactions (subject to investigation)</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">How to Request a Refund</h3>
              <ol className="list-decimal pl-6 mb-6 text-gray-700">
                <li>Contact our support team at support@nitionzpvtltd.com</li>
                <li>Provide transaction details and reason for refund request</li>
                <li>Our team will review your request within 3-5 business days</li>
                <li>If approved, refund will be processed within 7-10 business days</li>
              </ol>
              
              <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
                <p className="text-gray-700 mb-4">
                  For any refund or cancellation queries, please contact us at:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-nitionz-blue" />
                      <span className="text-gray-700">support@nitionzpvtltd.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-nitionz-blue" />
                      <span className="text-gray-700">+91-7023555429</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-nitionz-blue" />
                      <span className="text-gray-700">Mon-Sat: 10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-nitionz-blue mt-1" />
                      <span className="text-gray-700">NITIONZ, RAMPURA, CHITALWANA,<br />SANCHORE, JALORE, 343041</span>
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