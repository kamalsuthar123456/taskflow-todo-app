/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        accent: "#22c55e",
        dark: "#020617",
        muted: "#64748b"
      },
      fontFamily: {
        sans: ["system-ui", "Inter", "Segoe UI", "sans-serif"]
      }
    },
  },
  plugins: [],
}
