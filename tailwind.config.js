/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				brand: {
					50: '#eef7ff',
					100: '#d9ecff',
					500: '#2775f5',
					600: '#1d5fd6',
					700: '#194eae'
				}
			}
		}
	},
	plugins: []
};
