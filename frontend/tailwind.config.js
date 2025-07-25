/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0c0c0c',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out',
        'fade-in-delayed': 'fade-in 1s ease-out 0.5s both',
        'slide-up': 'slide-up 0.8s ease-out 0.2s both',
        'scroll-right': 'scroll-right 60s linear infinite',
        'scroll-left': 'scroll-left 80s linear infinite',
        'scroll-right-slow': 'scroll-right-slow 100s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'fade-in': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'slide-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(40px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'scroll-right': {
          'from': {
            transform: 'translateX(-100%)'
          },
          'to': {
            transform: 'translateX(100vw)'
          }
        },
        'scroll-left': {
          'from': {
            transform: 'translateX(100vw)'
          },
          'to': {
            transform: 'translateX(-100%)'
          }
        },
        'scroll-right-slow': {
          'from': {
            transform: 'translateX(-100%)'
          },
          'to': {
            transform: 'translateX(100vw)'
          }
        },
        'glow': {
          'from': {
            'box-shadow': '0 0 20px rgba(168, 85, 247, 0.3)'
          },
          'to': {
            'box-shadow': '0 0 30px rgba(168, 85, 247, 0.6)'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-lg': '0 0 30px rgba(168, 85, 247, 0.5)',
      }
    },
  },
  plugins: [],
} 