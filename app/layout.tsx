import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FirebaseProvider } from './components/FirebaseProvider'
import { NotificationProvider } from './contexts/NotificationContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nitionz Pvt Ltd - Secure Fixed Deposits for Safe Wealth Growth',
  description: 'Secure your future with Nitionz Pvt Ltd\'s trusted Fixed Deposits. High returns 14-20% annually, transparent investments, safe & reliable FD plans in India.',
  keywords: 'Fixed Deposit, Secure Investment, Nitionz Pvt Ltd, FD India, High Returns FD, Safe Investment, Wealth Growth, Financial Security',
  authors: [{ name: 'Kamlesh Choudhary' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Nitionz Pvt Ltd - Secure Fixed Deposits for Safe Wealth Growth',
    description: 'Secure your future with trusted Fixed Deposits. High returns 14-20% annually, transparent investments for everyone.',
    type: 'website',
    url: 'https://nitionzpvtltd.com/',
    siteName: 'Nitionz Pvt Ltd',
    images: [
      {
        url: 'https://nitionzpvtltd.com/assets/nitionz-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nitionz Pvt Ltd - Secure Fixed Deposits',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nitionz Pvt Ltd - Secure Fixed Deposits',
    description: 'High returns 14-20% annually on secure Fixed Deposits. Safe & reliable investments.',
    images: ['https://nitionzpvtltd.com/assets/nitionz-twitter-card.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </FirebaseProvider>
      </body>
    </html>
  )
}