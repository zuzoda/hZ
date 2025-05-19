import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "1E212C": "#1E212C",
        "5AE1FF1A": "#CF4E751A",
        "5AE1FF": "#CF4E75",
        "5AFFCE": "#CF4E5B",
        242732: "#242732",
      },
      backgroundImage: {},
      fontFamily: { DMSans: "DM Sans" },
      fontSize: { 9: "9px", 11: "11px", 13: "13px" },
      screens: {
        "2k": "2048px",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-hide::-webkit-scrollbar": { display: "none" },
        ".scrollbar-hide": {
          "scrollbar-width": "none",
          "-ms-overflow-style": "none",
        },
      };
      addUtilities(newUtilities);
    }),
  ],
};
