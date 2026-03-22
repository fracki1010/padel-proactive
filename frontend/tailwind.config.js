import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0F0A",
        foreground: "#FFFFFF",
        primary: {
          50: "#f4ffe5",
          100: "#e6ffcc",
          200: "#cdff99",
          300: "#a9ff66",
          400: "#80ff33",
          500: "#A3FF33", // Main Lime Green
          600: "#82cc29",
          700: "#60991f",
          800: "#416614",
          900: "#22330a",
          DEFAULT: "#A3FF33",
        },
        dark: {
          100: "#1C241C",
          200: "#121812", // Card background
          300: "#0A0F0A", // Main background
        },
        accent: {
          blue: "#3D5AFE",
          orange: "#FF9100",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
