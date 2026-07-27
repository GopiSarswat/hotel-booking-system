/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08090b",
        panel: "#111317",
        accent: "#7c6cff",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      boxShadow: { glow: "0 20px 80px rgba(92, 77, 255, .18)" },
    },
  },
  plugins: [],
};

