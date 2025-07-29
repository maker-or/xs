import { type Config } from "tailwindcss";


export default {
	darkMode: ["class"],
	content: ["./src/**/*.tsx"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Geist'], // GeistSans as the default font-sans
				serif: ['Instrument Serif', 'serif'], // Instrument_Serif as font-serif
				handwriting: ['Kalam', 'Comic Sans MS', 'cursive'], // For handwritten-style labels
			  },
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {},
			boxShadow: {
				'custom-inset': 'inset 7px 5px 13px 1px rgba(153, 56, 0, 1)',
			  },
			keyframes: {
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' },
				},
			},
			animation: {
				'caret-blink': 'caret-blink 1.25s ease-out infinite',
			},
		}
	},
	plugins: [require('tailwindcss-motion')],
} satisfies Config;
