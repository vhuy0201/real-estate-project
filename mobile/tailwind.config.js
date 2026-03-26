/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8", // Customize your primary color
        secondary: "#64748b",
      },
    },
  },
  plugins: [],
};
