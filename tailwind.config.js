/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Exo 2', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        brand: {
          cyan: '#00e5ff',
          purple: '#8b5cf6',
          green: '#4ade80',
          red: '#f87171',
        },
        surface: {
          900: '#050912',
          800: '#0a1120',
          700: '#0f1a2e',
          600: '#162035',
          500: '#1e2d4a',
        }
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 1.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,229,255,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0,229,255,0.8), 0 0 60px rgba(0,229,255,0.4)' },
        },
        'glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        }
      }
    },
  },
  plugins: [],
}
