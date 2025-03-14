/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'anime-dark': '#13111c',
        'anime-darker': '#0e0c15',
        'anime-primary': '#ec4899',
        'anime-secondary': '#a855f7',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 15s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(236, 72, 153, 0.5)',
      },
      fontFamily: {
        'anime': ['Exo', 'sans-serif'],
        'anime-text': ['Poppins', 'sans-serif'],
        'anime-cursive': ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};