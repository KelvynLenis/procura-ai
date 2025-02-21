import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				'procura-ai-blue': "#002E72",
				'procura-ai-white': "#F3F8FE",
				'procura-ai-black': "#282828",
				'procura-ai-zinc': "#232323",
				'procura-ai-red': "#CF4227",
				'procura-ai-yellow': "#D8A913",
				'procura-ai-dark-yellow': "#C89900",
				'robbery-bg': 'rgb(239 68 68 / 0.3)',
				'robbery-text': 'rgb(185 28 28)',
				'lost-bg': 'rgb(234 179 8 / 0.3)',
				'lost-text': 'rgb(161 98 7)',
				'theft-bg': 'rgb(249 115 22 / 0.4)',
				'theft-text': 'rgb(194 65 12)',
				'regular-bg': 'rgb(132 204 22 / 0.3)',
				'regular-text': 'rgb(77 124 15)',
				'heat-1': '#FECF3E',
				'heat-2': '#F3AD39',
				'heat-3': '#E78A33',
				'heat-4': '#DC662E',
				'heat-5': '#D04228',
				primary: '#002E72',
				secondary: '#0F2498',
				tertiary: '#96A6FF',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			spacing: {
				'18': '68.2px'
			},
			backgroundImage: {
				faq: "url('../assets/images/faq-bg.png')",
				'landing-bg': "url('../assets/images/landing-bg.png')",
				'login-bg': "url('../assets/images/login-banner.png')",
				'device-bg': "url('../assets/images/devices-bg.png')",
				'hero-bg': "url('../assets/images/hero-bg.png')",
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
