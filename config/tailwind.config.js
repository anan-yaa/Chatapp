/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/**/*.html"], // adjust if HTML is in another folder
  theme: {
    extend: {
      fontFamily: {
        lora: ['Lora', 'serif'], // adds `font-lora` class
      },
    },
  },
  plugins: [],
}
