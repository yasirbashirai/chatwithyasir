/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#288672",
          light: "#36C9AB",
          dark: "#165A4C",
        },
        ink: "#0F2E27",
        cream: {
          DEFAULT: "#F9EBDC",
          muted: "#FDF6EE",
        },
        gold: {
          DEFAULT: "#E2A93C",
          light: "#F7D06E",
          dark: "#A67B30",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        accent: ['"Playfair Display"', "Georgia", "serif"],
      },
      keyframes: {
        "bubble-in": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "blob": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(40px,-30px) scale(1.1)" },
          "66%": { transform: "translate(-30px,20px) scale(0.95)" },
        },
        "bounce-dot": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "bubble-in": "bubble-in 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "blob": "blob 18s ease-in-out infinite",
        "bounce-dot": "bounce-dot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
