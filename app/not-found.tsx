'use client'

import Link from 'next/link'
import Header from './components/Header'
import Footer from './components/Footer'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-6xl font-bold text-nitionz-blue mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
            <p className="text-gray-600 mb-8">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="bg-nitionz-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </Link>
              <button 
                onClick={() => window.history.back()}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}