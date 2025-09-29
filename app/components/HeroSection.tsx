'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Shield, Users, Star } from 'lucide-react'

const heroImages = [
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])



  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20" id="hero-section">
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(30, 64, 175, 0.8) 50%, rgba(0, 0, 0, 0.6) 100%), url('${image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
          />
        ))}
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-nitionz-orange/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-blue-400/10 rounded-full animate-pulse delay-2000"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transform transition-all duration-1000 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium mb-8 border border-white/20">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Trusted by 10,000+ Investors</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="block">Secure Your Future with</span>
            <span className="block bg-gradient-to-r from-nitionz-orange to-yellow-400 bg-clip-text text-transparent">
              Smart Investments
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
            Experience guaranteed returns of <span className="font-bold text-nitionz-orange">14-20% annually</span> with our secure fixed deposit plans. Your journey to financial freedom starts here.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex justify-center mb-12">
            <Link 
              href="/investment-plans" 
              className="group inline-flex items-center justify-center bg-nitionz-orange hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 hover:scale-105"
            >
              <span>Start Investing Now</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">High Returns</h3>
              <p className="text-white/80 text-sm">Up to 20% annual returns guaranteed</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-center mb-3">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">100% Secure</h3>
              <p className="text-white/80 text-sm">Bank-grade security & transparency</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Expert Support</h3>
              <p className="text-white/80 text-sm">Dedicated investment advisors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-8 z-20 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}