/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      screens: {
        'sm': '375px',
        'md': '425px'
      },
      colors: {
        primary: "#0F2498",
        secondary: "#151312",
        'procura-ai-blue': '#002E72',
        'procura-ai-white': '#F3F8FE',
        'procura-ai-black': '#282828',
        'procura-ai-zinc': '#232323',
        'procura-ai-red': '#CF4227',
        'procura-ai-yellow': '#D8A913',
        'procura-ai-dark-yellow': '#C89900',
        accent: "#AB8BFF",
      }
    },
  },
  plugins: [],
}