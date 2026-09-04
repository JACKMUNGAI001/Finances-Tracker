/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#F7F7F8',
        'app-surface': '#FFFFFF',
        'app-secondary': '#FAFAFA',
        'brand': '#8B5CF6',
        'brand-dark': '#7C3AED',
        'brand-light': '#A78BFA',
        'brand-soft': '#F3E8FF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        'text-very-muted': '#D1D5DB',
        'accent-green': '#22C55E',
        'accent-green-light': '#DCFCE7',
        'accent-red': '#EF4444',
        'accent-red-light': '#FEE2E2',
        'accent-blue': '#3B82F6',
        'accent-orange': '#F97316',
        'accent-cyan': '#06B6D4',
        'accent-pink': '#EC4899',
        'accent-amber': '#F59E0B',
        'border-light': '#F1F1F3',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xs': '10px',
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(0,0,0,0.08)',
        'card': '0 2px 16px rgba(0,0,0,0.06)',
        'nav': '0 -4px 24px rgba(0,0,0,0.04)',
        'glow': '0 8px 24px rgba(139, 92, 246, 0.30)',
        'fab': '0 8px 24px rgba(124, 58, 237, 0.30)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      maxWidth: {
        'app': '1280px',
      },
    },
  },
  plugins: [],
}
