import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1e3a34',
          900: '#0f1f1c',
          800: '#1e3a34',
          700: '#27423e',
        },
        moss: {
          DEFAULT: '#41646d',
          600: '#41646d',
          500: '#526266',
          400: '#7a9188',
        },
        sand: {
          DEFAULT: '#f4ede4',
          200: '#f4ede4',
          100: '#faf8f5',
        },
        accent: '#d3e2dc',
      },
      fontFamily: {
        tajawal: ['var(--font-tajawal)', 'system-ui', 'sans-serif'],
        amiri: ['var(--font-amiri)', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease both',
        'fade-in': 'fadeIn 0.5s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
