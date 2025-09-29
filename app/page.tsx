import Link from 'next/link'
import Header from './components/Header'
import Footer from './components/Footer'
import HeroSection from './components/HeroSection'
import { Shield, TrendingUp, Users, Clock, CheckCircle, Star, ArrowRight, Zap, Award, Lock } from 'lucide-react'

export default function Home() {
  const stats = [
    { value: '14-20%', label: 'Annual Returns', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { value: '12', label: 'Months Tenure', icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { value: '100%', label: 'Secure', icon: Shield, color: 'text-purple-600 bg-purple-50' },
    { value: '5+', label: 'Investment Plans', icon: Award, color: 'text-orange-600 bg-orange-50' }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your investments are protected with industry-leading security measures and transparent processes.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'High Returns',
      description: 'Enjoy competitive returns of 14-20% annually on your fixed deposit investments with guaranteed payouts.',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Zap,
      title: 'Quick & Easy',
      description: 'Simple KYC verification and seamless investment process with instant digital documentation.',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Dedicated support team available Monday to Saturday to assist with your investment journey.',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      icon: Lock,
      title: 'Transparent Process',
      description: 'Complete transparency in all transactions with detailed reporting and regular updates.',
      color: 'bg-teal-50 text-teal-600'
    },
    {
      icon: CheckCircle,
      title: 'Proven Track Record',
      description: 'Trusted by thousands of investors with a consistent history of timely returns and payouts.',
      color: 'bg-indigo-50 text-indigo-600'
    }
  ]

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Business Owner',
      content: 'Nitionz has been my go-to investment platform for the past 2 years. Consistent returns and excellent support.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      content: 'The transparency and security offered by Nitionz gives me complete peace of mind with my investments.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Entrepreneur',
      content: 'Started with a small investment and now have multiple plans. The returns are exactly as promised.',
      rating: 5
    }
  ]

  return (
    <>
      <Header />
      
      <main id="main-content">
        <HeroSection />

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Star className="w-4 h-4" />
                  <span>Trusted Investment Partner</span>
                </div>
                
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Build Your Financial Future with 
                  <span className="text-nitionz-blue"> Confidence</span>
                </h2>
                
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Your trusted partner for secure fixed deposit investments. We specialize in providing transparent, reliable, and profitable investment opportunities that help you build a stable financial future.
                </p>
                
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  With competitive returns ranging from 14% to 20% annually, our investment plans are designed to meet diverse financial goals while maintaining the highest standards of security and transparency.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/investment-plans" 
                    className="inline-flex items-center justify-center bg-nitionz-blue hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl group"
                  >
                    <span>Explore Investment Plans</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center justify-center border-2 border-gray-300 hover:border-nitionz-blue text-gray-700 hover:text-nitionz-blue px-8 py-4 rounded-xl transition-all duration-300 font-semibold"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">High Returns</h3>
                        <p className="text-sm text-gray-600">Up to 20% annual returns</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                          <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">100% Secure</h3>
                        <p className="text-sm text-gray-600">Bank-grade security</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-8">
                      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                          <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Quick Process</h3>
                        <p className="text-sm text-gray-600">Start investing in minutes</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                          <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Expert Support</h3>
                        <p className="text-sm text-gray-600">24/7 customer support</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -left-4 w-20 h-20 bg-nitionz-blue/10 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-nitionz-orange/10 rounded-full animate-pulse delay-1000"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-nitionz-blue/10 text-nitionz-blue px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                <span>Why Choose Nitionz</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Experience Excellence in Every Investment
              </h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover the perfect blend of security, transparency, and high returns with our carefully crafted investment solutions designed for your financial success.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-nitionz-blue/20 hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-nitionz-blue transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                <span>Customer Stories</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Trusted by Thousands of Investors
              </h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See what our satisfied customers have to say about their investment experience with Nitionz.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-nitionz-blue/10 rounded-full flex items-center justify-center mr-4">
                      <span className="text-nitionz-blue font-bold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-24 bg-gradient-to-r from-nitionz-blue via-blue-600 to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Start Your Investment Journey?
            </h2>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              Join thousands of satisfied investors who trust Nitionz for their financial growth. Start building your wealth today with our secure investment plans.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register" 
                className="inline-flex items-center justify-center bg-white text-nitionz-blue px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <span>Get Started Today</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/investment-plans" 
                className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-nitionz-blue transition-all duration-300"
              >
                View Investment Plans
              </Link>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Guaranteed Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Secure Platform</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialService",
            "name": "Nitionz Private Limited",
            "alternateName": "Nitionz Pvt Ltd",
            "description": "Secure Fixed Deposit investment company offering high returns of 14-20% annually with transparent and reliable investment plans.",
            "url": "https://nitionzpvtltd.com",
            "logo": "https://nitionzpvtltd.com/assets/nitionz-logo.png",
            "image": "https://nitionzpvtltd.com/assets/nitionz-hero-image.jpg",
            "telephone": "+91-7023555429",
            "email": "support@nitionzpvtltd.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "RAMPURA, CHITALWANA",
              "addressLocality": "SANCHORE",
              "addressRegion": "JALORE",
              "postalCode": "343041",
              "addressCountry": "IN"
            },
            "openingHours": "Mo-Sa 10:00-18:00",
            "priceRange": "₹100,000 - ₹10,00,000",
            "serviceType": "Fixed Deposit Investment",
            "areaServed": "India",
            "founder": {
              "@type": "Person",
              "name": "Nitin Patel"
            },
            "sameAs": [
              "https://www.linkedin.com/company/nitionz-pvt-ltd",
              "https://www.instagram.com/nitionzpvtltd"
            ]
          })
        }}
      />
    </>
  )
}