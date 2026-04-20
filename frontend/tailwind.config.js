/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Brand Blue
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4', // Cyan/Glass Accent
          600: '#0891b2',
          700: '#0e7490',
        },
        coral: {
          500: '#f43f5e', // Vibrant red/pink for gradients
        },
        violet: {
          500: '#8b5cf6', // Indigo/violet for secondary glowing
        },
        danger: '#ef4444',
        warning: '#f59e0b',
        // White transparencies for glass
        glass: {
          100: 'rgba(255, 255, 255, 0.1)',
          200: 'rgba(255, 255, 255, 0.2)',
          500: 'rgba(255, 255, 255, 0.5)',
          700: 'rgba(255, 255, 255, 0.7)',
          900: 'rgba(255, 255, 255, 0.9)',
        },
        background: '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Fira Code"', '"Cascadia Code"', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px', // Ultra round for bento grids
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
        'glass-hover': '0 12px 48px 0 rgba(31, 38, 135, 0.12)',
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.3)',
        'floating': '0 20px 60px -10px rgba(0, 0, 0, 0.1)',
        'btn': '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
        'btn-hover': '0 6px 20px rgba(59, 130, 246, 0.4)',
      },
      backgroundImage: {
        'gradient-mesh': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 1024 1024\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
        '3xl': '64px',
      }
    },
  },
  plugins: [],
}
