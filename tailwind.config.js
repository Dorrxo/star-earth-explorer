/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-dark': '#0A101F',
        'space-panel': 'rgba(25,35,60,0.7)',
        'tech-blue': '#1677FF'
      }
    },
  },
  plugins: [],
}
