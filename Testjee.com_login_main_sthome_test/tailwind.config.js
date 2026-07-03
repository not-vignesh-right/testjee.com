/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gta': {
          'primary': '#3B82F6', // Bright blue from logo
          'secondary': '#1E40AF', // Darker blue
          'accent': '#60A5FA', // Light blue
          'success': '#10B981', // Green for answered questions
          'warning': '#F59E0B', // Orange for warnings
          'danger': '#EF4444', // Red for visited but unanswered
          'purple': '#8B5CF6', // Purple for marked questions
          'dark': '#0F172A', // Dark background
          'light': '#F8FAFC' // Light background
        },
        // Admin panel system (Phase 6): a canvas subtly tinted toward gta-primary's own hue
        // instead of a flat gray, plus a distinct `surface` for the few genuinely elevated
        // panels. Scoped to the admin panel only — student exam UI keeps its existing tokens.
        canvas: '#F6F8FB',
        surface: '#FFFFFF',
        // ink-500 is the darkest "muted" shade that still clears 4.5:1 body-text contrast
        // against both `canvas` and `surface` (~5.9:1 measured) — anything lighter (like
        // Tailwind's default slate-400/500) reads as decorative gray-on-white and fails.
        // Use ink-400 only for non-text decoration (icon strokes, dividers), never for copy.
        ink: {
          900: '#0F172A',
          700: '#334155',
          500: '#52627A',
          400: '#94A3B8',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
} 