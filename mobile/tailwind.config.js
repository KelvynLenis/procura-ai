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
        primary: "#212A38",
        secondary: "#0B7AF5",
        'procura-ai-blue': '#0B7AF5',
        'procura-ai-dark-blue': '#212A38',
        'procura-ai-light-blue': '#3CD9D6',
        'procura-ai-green': '#97DC75',
        'procura-ai-white': '#F3F8FE',
        'procura-ai-yellow': '#F5DF16',
        'procura-ai-pink': '#F566F3',
        'procura-ai-black': '#282828',
        'procura-ai-zinc': '#232323',
        'procura-ai-red': '#CF4227',
        'procura-ai-dark-yellow': '#C89900',
        'robbery-bg': 'rgb(239 68 68 / 0.3)',
        'robbery-text': 'rgb(185 28 28)',
        'lost-bg': 'rgb(234 179 8 / 0.3)',
        'lost-text': 'rgb(161 98 7)',
        'theft-bg': 'rgb(249 115 22 / 0.4)',
        'theft-text': 'rgb(194 65 12)',
        'regular-bg': 'rgb(132 204 22 / 0.3)',
        'regular-text': 'rgb(77 124 15)',
        'recovered-bg': 'rgb(60 217 214 / 0.5)',
        'recovered-text': 'rgb(33 127 125)',
        accent: "#AB8BFF",
      }
    },
  },
  plugins: [],
}