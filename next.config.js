/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for production
  images: {
    domains: ['res.cloudinary.com', 'firebasestorage.googleapis.com'],
  },
  
  // Compression for better performance
  compress: true,
  
  // Experimental features for Firebase
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig