/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        forge: {
          ink: "#151515",
          paper: "#f7f5f0",
          panel: "#ffffff",
          line: "#dedbd2",
          accent: "#3b7f75",
          amber: "#c7842b"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(30, 29, 25, 0.09)"
      }
    }
  },
  plugins: []
};
