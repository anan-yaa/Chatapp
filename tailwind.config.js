/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/**/*.html",
    "./dist/**/*.js",
    "./src/**/*.ts",
    "./src/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        "chat-dark": "#0f0f0f",
        "chat-darker": "#000000",
        "chat-gray": "#1a1a1a",
        "chat-blue": "#4a90e2",
        "chat-blue-light": "#6ba3f0",
        "chat-border": "#333333",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        slideIn: "slideIn 0.8s ease-out",
        fadeIn: "fadeIn 1s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
            opacity: "0.3",
          },
          "50%": {
            transform: "translateY(-20px)",
            opacity: "0.8",
          },
        },
        glow: {
          "0%": {
            boxShadow: "0 0 5px rgba(59, 130, 246, 0.3)",
          },
          "100%": {
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
          },
        },
        slideIn: {
          "0%": {
            transform: "translateY(30px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};
