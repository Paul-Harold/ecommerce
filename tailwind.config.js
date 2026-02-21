/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0B0D10',
        electric: '#40E0FF',
        ion: '#B6FF3B',
      },
    },
  },
  plugins: [],
}