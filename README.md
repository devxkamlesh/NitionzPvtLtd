# Nitionz Next.js Website

A modern, SEO-optimized Next.js website for Nitionz Pvt Ltd - a secure fixed deposit investment platform.

## Features

### 🚀 Core Features
- **Next.js 14** with App Router for optimal performance
- **Firebase Integration** for authentication and data management
- **SEO Optimized** with proper meta tags and structured data
- **Responsive Design** with Tailwind CSS
- **TypeScript** for type safety
- **Accessibility Compliant** with WCAG guidelines

### 🔐 Authentication & User Management
- User registration and login with Firebase Auth
- **Google Sign-In integration** for seamless authentication
- KYC verification system
- Role-based access control (user/admin)
- Protected dashboard routes
- Profile completion for Google users

### 💰 Investment Platform
- Multiple investment plans (14-20% returns)
- KYC-gated investment purchases
- Bank transfer payment system with proof upload
- Order management and tracking
- Admin verification workflow

### 📊 Dashboard Features
- User dashboard with investment overview
- KYC status tracking
- Order history and management
- Admin panel for order/KYC verification

### 🎨 Design & UX
- Modern, professional design
- Smooth animations and transitions
- Mobile-first responsive layout
- Hero slideshow with collapsible content
- Interactive components with Lucide React icons

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for document uploads)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)


## Project Structure

```
app/
├── auth/
│   ├── login/page.tsx          # Login page
│   └── register/page.tsx       # Registration page
├── components/
│   ├── FirebaseProvider.tsx    # Firebase context provider
│   ├── Header.tsx              # Navigation header
│   ├── Footer.tsx              # Site footer
│   └── HeroSection.tsx         # Landing page hero
├── contact/page.tsx            # Contact form page
├── dashboard/page.tsx          # User dashboard
├── investment-plans/page.tsx   # Investment plans listing
├── lib/
│   └── firebase.ts             # Firebase configuration
├── globals.css                 # Global styles
├── layout.tsx                  # Root layout
└── page.tsx                    # Home page
```

## Key Features Implementation

### Authentication Flow

#### Email/Password Authentication
1. User registers with email/password
2. Firebase creates user account
3. User document created in Firestore with KYC status
4. Protected routes check authentication status

#### Google Authentication
1. User clicks "Continue with Google"
2. Google OAuth popup for account selection
3. Automatic user document creation in Firestore
4. Redirect to dashboard with profile completion prompts

### Investment Process
1. User completes KYC verification
2. Admin approves KYC (enables BUY buttons)
3. User selects investment plan
4. Bank transfer instructions provided
5. User uploads payment proof
6. Admin verifies payment
7. Order status updated to "paid"

### Admin Workflow
- KYC document review and approval
- Payment proof verification
- Order status management
- User management and reporting

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## SEO Features

- **Meta Tags**: Comprehensive meta tags for all pages
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags
- **Structured Data**: JSON-LD for search engines
- **Sitemap**: Auto-generated sitemap
- **Robots.txt**: Search engine crawling instructions

## Performance Optimizations

- **Image Optimization**: Next.js Image component with WebP support
- **Code Splitting**: Automatic code splitting with App Router
- **Lazy Loading**: Components and images loaded on demand
- **Caching**: Proper caching headers and strategies
- **Bundle Analysis**: Optimized bundle sizes

## Security Features

- **Firebase Security Rules**: Proper Firestore security rules
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Built-in Next.js protections
- **Secure Headers**: Security headers configuration

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software owned by Nitionz Pvt Ltd.

## Usage

### Testing the Application

1. **Homepage**: Visit `http://localhost:3000` to see the landing page with hero slideshow
2. **Contact Form**: Go to `/contact` and submit a form to test Firebase integration
3. **Admin Panel**: Visit `/admin` to view contact submissions (requires authentication)
4. **Authentication**: Test user registration and login at `/auth/register` and `/auth/login`
5. **Investment Plans**: View available plans at `/investment-plans`
6. **Dashboard**: User dashboard at `/dashboard` (requires authentication)

### Key Features to Test

- ✅ Contact form submission and storage in Firestore
- ✅ User registration and authentication (Email/Password + Google)
- ✅ **Google Sign-In functionality**
- ✅ Admin panel for viewing contact submissions
- ✅ Responsive design on mobile and desktop
- ✅ SEO optimization with meta tags
- ✅ KYC status tracking in dashboard
- ✅ Profile completion for Google users

### Admin Panel Access

Currently, any authenticated user can access the admin panel at `/admin`. In production, you should implement proper role-based access control.

### Contact Form Data

All contact form submissions are stored in the `contact_submissions` collection and can be viewed in the admin panel with:
- Contact information (name, email, phone)
- Subject and message
- Submission timestamp
- Status tracking (new, read, replied)
- Admin actions to mark as read/replied

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**: Make sure your Firebase project is active and the configuration is correct
2. **Build Errors**: Run `npm install` to ensure all dependencies are installed
3. **Port Already in Use**: Next.js will automatically try the next available port (3001, 3002, etc.)

### Firebase Security Rules

Make sure your Firestore has appropriate security rules. For development, you can use:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow anyone to write contact submissions
    match /contact_submissions/{document} {
      allow create: if true;
      allow read, update: if request.auth != null;
    }
  }
}
```

## Support

For technical support or questions:
- Email: support@nitionzpvtltd.com
- Phone: +91-7023555429

## Developer

Developed by [Kamlesh Choudhary](https://www.linkedin.com/in/kamlesh-choudhary)
