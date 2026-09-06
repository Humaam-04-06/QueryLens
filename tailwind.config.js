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
        dark: {
          950: '#070a0f',
          900: '#0b101b',
          850: '#101726',
          800: '#162035',
          700: '#22304e',
          600: '#334468',
        },
        brand: {
          primary: '#38bdf8', // Cyan
          secondary: '#6366f1', // Indigo
          accent: '#8b5cf6', // Purple
          emerald: '#10b981', // Optimization success
          amber: '#f59e0b', // Warning
          rose: '#f43f5e', // Critical / bottleneck
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(56, 189, 248, 0.35)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.35)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.35)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
