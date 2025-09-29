'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { Shield, FileText, Clock, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-nitionz-blue via-blue-700 to-blue-900 flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms & Conditions</h1>
            <p className="text-xl text-white/90">Our commitment to transparency and trust</p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
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
              <FileText className="w-8 h-8 text-nitionz-blue" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Terms & Conditions</h2>
                <p className="text-sm text-gray-600 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Last Updated: 27-08-2025</span>
                </p>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-6">
                Welcome to NITIONZ PRIVATE LIMITED ("Company", "we", "our", "us"). By accessing or using our website https://nitionzpvtltd.com and our investment plans, you agree to comply with and be bound by the following terms and conditions.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">1. Eligibility</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>You must be 18 years or older to invest.</li>
                <li>By enrolling in a plan, you confirm that the details provided by you are correct and true.</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">2. Services</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>We provide structured investment plans with fixed ROI and tenure.</li>
                <li>All returns are calculated as per plan details mentioned on the website.</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">3. Payments</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Payments are processed through secure third-party gateways (Razorpay, etc.).</li>
                <li>Once payment is confirmed, your plan will be activated.</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">4. Risks</h3>
              <p className="text-gray-700 mb-6">
                All investments carry inherent risks. Past performance does not guarantee future results. Please invest only what you can afford to lose.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">5. Limitation of Liability</h3>
              <p className="text-gray-700 mb-6">
                The company shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our services.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">6. Governing Law</h3>
              <p className="text-gray-700">
                These terms shall be governed by and construed in accordance with the laws of India.
              </p>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-nitionz-blue">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-nitionz-blue mt-1" />
                  <div>
                    <h4 className="font-semibold text-nitionz-blue mb-2">Important Notice</h4>
                    <p className="text-gray-700 text-sm">
                      By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions. If you do not agree with any part of these terms, please do not use our services.
                    </p>
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