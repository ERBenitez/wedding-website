/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          DEFAULT: '#2d2f8e',
          light: '#4a4db5',
          dark: '#1e2060',
        },
        pink: {
          DEFAULT: '#ee9b9b',
          light: '#f5c4c4',
          dark: '#d97a7a',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#e5c76b',
          dark: '#b8960c',
        },
        background: {
          light: '#f8f5f2',
          dark: '#1a1a1a',
        },
      },
      fontFamily: {
        display: ['var(--font-star-jedi)', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
        accent: ['Dancing Script', 'cursive'],
      },
      animation: {
        'lightsaber-on': 'lightsaberOn 0.8s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        lightsaberOn: {
          '0%': { width: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { width: '100%', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #ee9b9b, 0 0 10px #ee9b9b' },
          '100%': { boxShadow: '0 0 20px #ee9b9b, 0 0 30px #ee9b9b, 0 0 40px #ee9b9b' },
        },
      },
    },
  },
  plugins: [],
}
