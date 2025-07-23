import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'mobile-sm': '320px',
      mobile: '375px',
      'mobile-lg': '425px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '1.5xl': '1440px',
      '2xl': '1536px',
      '3xl': '1700px',
    },
    extend: {
      colors: {
        'procura-ai-blue': '#002E72',
        'procura-ai-white': '#F3F8FE',
        'procura-ai-black': '#282828',
        'procura-ai-zinc': '#232323',
        'procura-ai-red': '#CF4227',
        'procura-ai-yellow': '#D8A913',
        'procura-ai-dark-yellow': '#C89900',
        'robbery-bg': 'rgb(208 66 40 / 0.26)',
        'robbery-text': 'rgb(208 66 40)',
        'lost-bg': '#F9EC73',
        'lost-text': '#BFA300',
        'theft-bg': '#E39000',
        'theft-text': '#F7D69D',
        'regular-bg': 'rgb(132 204 22 / 0.3)',
        'regular-text': 'rgb(77 124 15)',
        'recovered-bg': 'rgb(60 217 214 / 0.5)',
        'recovered-text': 'rgb(33 127 125)',
        'heat-1': '#FECF3E',
        'heat-2': '#F3AD39',
        'heat-3': '#E78A33',
        'heat-4': '#DC662E',
        'heat-5': '#D04228',
        primary: '#212A38',
        secondary: '#0B7AF5',
        tertiary: '#96A6FF',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      height: {
        400: '400px',
      },
      spacing: {
        '18': '68.2px',
      },
      backgroundImage: {
        faq: "url('../assets/images/faq-bg.png')",
        'faq-light': "url('../assets/images/faq-bg-light.png')",
        'landing-bg': "url('../assets/images/landing-bg.png')",
        'login-bg': "url('../assets/images/login-bg.svg')",
        'device-bg': "url('../assets/images/devices-bg.png')",
        'hero-bg': "url('../assets/images/hero-bg.png')",
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
