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
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
} 