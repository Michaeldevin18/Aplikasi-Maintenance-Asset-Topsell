
/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          red: '#E60012', // Vivid red based on description
          dark: '#B3000E',
          light: '#FF3342',
        }
      }
    },
  },
  plugins: [],
};
