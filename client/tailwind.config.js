import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Minimal palette
        primary: '#fff',
        secondary: '#111',
        neutral: colors.neutral,
        'text-primary': '#f3f4f6',
        background: {
          DEFAULT: '#000',
          light: '#18181b',
          dark: '#0a0a0a',
        },
        surface: {
          DEFAULT: '#18181b',
          light: '#232323',
          dark: '#111',
        },
        success: '#22c55e', // muted green
        error: '#ef4444',   // muted red
      },
      fontFamily: {
        sans: [
          'Metropolis',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        display: [
          'Metropolis',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
      fontSize: {
        'heading-1': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-2': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body-large': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'body-small': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      spacing: {
        'micro': '0.25rem',
        'small': '0.5rem',
        'default': '1rem',
        'medium': '1.5rem',
        'large': '2rem',
        'xlarge': '3rem',
      },
      boxShadow: {
        'button': '0 2px 4px rgba(0,0,0,0.15)',
        'button-hover': '0 3px 6px rgba(0,0,0,0.2)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'button': '0.5rem',
        'card': '5rem',
        'input': '0.5rem',
        'search': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 350ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'scale': 'scale 150ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.98)' },
        },
      },
    },
  },
  plugins: [],
} 