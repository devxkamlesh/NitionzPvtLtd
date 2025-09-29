import Link from 'next/link'
import Image from 'next/image'
import { Linkedin, Mail, Phone, MapPin, Clock, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/investment-plans', label: 'Investment Plans' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/legal', label: 'Legal Information' },
    { href: '/auth/register', label: 'Get Started' }
  ]

  const legalLinks = [
    { href: '/legal/terms', label: 'Terms & Conditions' },
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/refund', label: 'Refund Policy' }
  ]

  const socialLinks = [
    {
      href: 'https://www.instagram.com/devxkamlesh',
      icon: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      label: 'Follow us on Instagram',
      color: 'hover:text-pink-400'
    },
    {
      href: 'https://www.linkedin.com/in/kamlesh-choudhary',
      icon: Linkedin,
      label: 'Connect with us on LinkedIn',
      color: 'hover:text-blue-400'
    }
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex justify-center lg:justify-start mb-6">
              <Image
                src="/img/nitinz-logo.webp"
                alt="Nitionz Logo"
                width={60}
                height={60}
                className="h-16 w-16 object-contain"
                quality={100}
              />
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Your trusted partner for secure fixed deposit investments. Building your financial future with transparency, reliability, and expert guidance.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 bg-gray-800 rounded-lg text-gray-400 ${social.color} transition-all duration-300 hover:bg-gray-700 hover:scale-110`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Secure & Trusted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center text-gray-300 hover:text-nitionz-orange transition-colors duration-200"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Mail className="w-4 h-4 text-nitionz-orange" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <a
                    href="mailto:support@nitionzpvtltd.com"
                    className="text-gray-300 hover:text-nitionz-orange transition-colors"
                  >
                    support@nitionzpvtltd.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Phone className="w-4 h-4 text-nitionz-orange" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Phone</p>
                  <a
                    href="tel:+917023555429"
                    className="text-gray-300 hover:text-nitionz-orange transition-colors"
                  >
                    +91-7023555429
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <MapPin className="w-4 h-4 text-nitionz-orange" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Address</p>
                  <address className="text-gray-300 not-italic text-sm leading-relaxed">
                    NITIONZ, RAMPURA, CHITALWANA,<br />
                    SANCHORE, JALORE, 343041
                  </address>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Clock className="w-4 h-4 text-nitionz-orange" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Business Hours</p>
                  <p className="text-gray-300 text-sm">Mon-Sat: 10:00 AM - 6:00 PM</p>
                  <p className="text-gray-300 text-sm">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-gray-400 text-sm">
                &copy; {currentYear} Nitionz Pvt Ltd. All rights reserved.
              </p>

              {/* Legal Links */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {legalLinks.map((link, index) => (
                  <span key={link.href} className="flex items-center">
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-nitionz-orange transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                    {index < legalLinks.length - 1 && (
                      <span className="text-gray-600 mx-2">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Developer Credit */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Crafted with ❤️ by</span>
              <a
                href="https://www.linkedin.com/in/kamlesh-choudhary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nitionz-orange hover:text-orange-400 transition-colors font-semibold flex items-center space-x-1 group"
              >
                <span>Kamlesh Choudhary</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}