'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { FileText, Lock, RefreshCw, ArrowRight, Shield } from 'lucide-react'

export default function LegalPage() {
  const legalPages = [
    {
      title: 'Terms & Conditions',
      description: 'Our terms of service and user agreement for investment plans',
      icon: FileText,
      href: '/legal/terms',
      color: 'blue'
    },
    {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information',
      icon: Lock,
      href: '/legal/privacy',
      color: 'green'
    },
    {
      title: 'Refund & Cancellation',
      description: 'Our refund and cancellation policy for investment plans',
      icon: RefreshCw,
      href: '/legal/refund',
      color: 'orange'
    }
  ]

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-nitionz-blue via-blue-700 to-blue-900 flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Legal Information</h1>
            <p className="text-xl text-white/90">Transparency and trust in every aspect of our service</p>
          </div>
        </div>
      </section>

      {/* Legal Pages Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Policies</h2>
            <p className="text-xl text-gray-600">Clear, transparent, and comprehensive legal documentation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {legalPages.map((page, index) => (
              <Link
                key={index}
                href={page.href}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className={`w-16 h-16 bg-${page.color}-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <page.icon className={`w-8 h-8 text-${page.color}-600`} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-nitionz-blue transition-colors">
                  {page.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {page.description}
                </p>
                
                <div className="flex items-center text-nitionz-blue font-semibold group-hover:text-blue-700 transition-colors">
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Trust Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-nitionz-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-nitionz-blue" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Our Commitment to You</h3>
              <p className="text-xl text-gray-600">Building trust through transparency and clear communication</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Clear Terms</h4>
                <p className="text-gray-600 text-sm">Easy to understand terms and conditions with no hidden clauses</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Data Security</h4>
                <p className="text-gray-600 text-sm">Your personal information is protected with industry-standard security</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Fair Policies</h4>
                <p className="text-gray-600 text-sm">Transparent refund and cancellation policies for your peace of mind</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}