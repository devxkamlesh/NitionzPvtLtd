/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nitionz-blue': '#1e40af',
        'nitionz-orange': '#f97316',
        'nitionz-teal': '#0891b2'
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'subtle-glow': 'subtleGlow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        subtleGlow: {
          '0%': {
            filter: 'drop-shadow(0 0 2px rgba(234, 88, 12, 0.3))',
          },
          '100%': {
            filter: 'drop-shadow(0 0 6px rgba(234, 88, 12, 0.5))',
          },
        },
      },
    },
  },
  plugins: [],
}