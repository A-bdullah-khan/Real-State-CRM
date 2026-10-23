import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Indigo-leaning brand; paired with violet for AI accents (see .btn-ai / .text-gradient).
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        lift: '0 2px 6px -2px rgb(15 23 42 / 0.08), 0 16px 32px -12px rgb(15 23 42 / 0.18)',
        glow: '0 0 0 1px rgb(99 102 241 / 0.12), 0 6px 20px -6px rgb(99 102 241 / 0.45)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        typing: {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'scale(0.75)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out both',
        typing: 'typing 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
