import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#fcfaf4',
        foreground: '#1f2937',
        card: '#fffdf8',
        border: '#eadfca',
        primary: '#f59e0b',
        secondary: '#4d7c0f',
        accent: '#fef3c7',
        muted: '#f6efe1',
        destructive: '#dc2626'
      },
      boxShadow: {
        soft: '0 12px 30px -18px rgba(105, 73, 24, 0.35)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      },
      backgroundImage: {
        glow: 'radial-gradient(circle at top, rgba(245, 158, 11, 0.2), transparent 42%)'
      }
    }
  },
  plugins: []
} satisfies Config;
