/** @type {import('tailwindcss').Config} */
export default {
  // Must include TS/TSX paths so Tailwind can see classes like bg-red-500 in React components.
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}

