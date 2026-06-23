/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        card: '#ffffff',
        border: '#e2e8f0',
        textMain: '#0f172a',
        textMuted: '#64748b',
        primary: {
          DEFAULT: '#0f172a', // Solid deep slate
          hover: '#1e293b',
          light: '#f1f5f9',
        },
        accent: {
          DEFAULT: '#2563eb', // Solid electric blue
          hover: '#1d4ed8',
          light: '#eff6ff',
        },
        success: {
          DEFAULT: '#10b981',
          light: '#ecfdf5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fef2f2',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
