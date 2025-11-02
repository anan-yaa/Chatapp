/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-darker': '#0f0f1a',
        'chat-dark': '#1a1a2e',
        'chat-gray': '#16213e',
        'chat-blue': '#3b82f6',
        'chat-blue-light': '#60a5fa',
        'chat-border': '#2a2a3e',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'roboto-slab': ['"Roboto Slab"', 'serif'],
        'bitcount': ['"Bitcount Grid Double"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
