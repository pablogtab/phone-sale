/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    colors: {
      "white": "#FFFFFF",
      "black": "#000000",
      "primary-hover": "var(--primary-hover)",
      "primary": "var(--primary)",
      "accent": "var(--accent)",
      "text-primary-1": "var(--text-primary-1)",
      "text-2": "var(--text-2)",
      "contrast-1": "var(--contrast-1)",
      "background-1": "var(--background-1)",
      "background-2": "var(--background-2)",
      "background-3": "var(--background-3)",
      "background-4": "var(--background-4)",
      "green-1": "var(--green-1)",
      "tertiary": "var(--tertiary)",
      "tertiary-hover": "var(--tertiary-hover)",
      "warn-hover": "var(--warn-hover)",
      "warn": "var(--warn)",
      "text-gray-500": "var(--text-gray-500)",
    },
    extend: {
      keyframes: {
        appear: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        }
      },
      animation: {
        appear: 'appear 0.2s ease-in-out',
      }
    },
  },
  plugins: [require('tailwindcss-primeui')],
}
