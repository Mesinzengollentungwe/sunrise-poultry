/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1F4D2C",
          dark: "#123018",
          light: "#2E6B3E"
        },
        sunrise: {
          DEFAULT: "#F5A623",
          deep: "#E8720C",
          pale: "#FCE3B0"
        },
        cream: "#FAF5E9",
        maroon: {
          DEFAULT: "#7A1F1F",
          dark: "#5C1616"
        },
        barn: "#6B4423",
        ink: "#26261F"
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'Work Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      backgroundImage: {
        "sun-rays":
          "conic-gradient(from 0deg, transparent 0deg 10deg, rgba(245,166,35,0.35) 10deg 12deg, transparent 12deg 20deg)"
      },
      boxShadow: {
        stamp: "0 0 0 3px #FAF5E9, 0 0 0 5px #1F4D2C"
      }
    }
  },
  plugins: []
};
