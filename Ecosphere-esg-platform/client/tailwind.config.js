/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom branding colors for EcoSphere (ESG theme)
        brand: {
          green: {
            light: '#eefdf4',
            DEFAULT: '#10b981', // Emerald green
            dark: '#065f46',
          },
          blue: {
            light: '#eff6ff',
            DEFAULT: '#3b82f6', // Ocean blue
            dark: '#1e3a8a',
          },
          slate: {
            light: '#f8fafc',
            DEFAULT: '#64748b',
            dark: '#0f172a',
          }
        }
      },
    },
  },
  plugins: [],
}
