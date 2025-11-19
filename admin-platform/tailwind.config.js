/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
     colors: {
      'custom-green': '#27804A',
      'custom-pink': '#FFE3E3',
      'light-green': '#D4F4DD',  // ye wala light green background ke liye
    }
    },
  },
  plugins: [],
}

