import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'tan-300':'#ebecd0',
        'tan-500':'#858576',
        'tan-main':'#e8e9ce',
        'green-main':'#739552'
      },
      backgroundColor:{
        'dark-main':'#302e2b',
        'dark-secondary':'#615c57',
        'section-dark-bg':'#262522',
      },
      width: {
        400: '400px',
        760: '760px',
        780: '780px',
        800: '800px',
        1000: '1000px',
        1200: '1200px',
        1400: '1400px',
      },
      height: {
        80: '80px',
      }
    },
  },
  plugins: [],
} satisfies Config