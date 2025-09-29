'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Ban, Mail, Phone, Home } from 'lucide-react'

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/img/nitinz-logo.webp"
              alt="Nitionz Logo"
              width={80}
              height={80}
              className="h-20 w-20"
              quality={100}
            />
          </div>
          
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ban className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Restricted</h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your account has been temporarily restricted. This may be due to a violation of our terms of service or suspicious activity.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>What this means:</strong><br />
              • You cannot access your dashboard<br />
              • You cannot make new investments<br />
              • Existing investments remain safe
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-800 mb-3">
              If you believe this is a mistake, please contact our support team:
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Mail className="w-4 h-4" />
                <span>support@nitionzpvtltd.com</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Phone className="w-4 h-4" />
                <span>+91-7023555429</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <Link
              href="/contact"
              className="w-full flex items-center justify-center px-4 py-2 bg-nitionz-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            Business Hours: Monday - Saturday, 10:00 AM - 6:00 PM
          </p>
        </div>
      </div>
    </div>
  )
}