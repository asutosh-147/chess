import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "tan-300": "#ebecd0",
        "tan-500": "#858576",
        "tan-main": "#e8e9ce",
        "green-main": "#739552",
        "brown-main": "#ddb085",
      },
      backgroundColor: {
        "dark-main": "#302e2b",
        "dark-secondary": "#615c57",
        "section-dark-bg": "#262522",
        "whiteSquare-brown": "#edd6b0",
        "blackSquare-brown": "#b88762",
        "light-main-bg": "#d0aa7a",
        "light-secondary-400": "#deb887",
        "light-secondary-700": "#7d5f11",
        "light-secondary-100": "#fff8dc",
      },
      width: {
        400: "400px",
        760: "760px",
        780: "780px",
        800: "800px",
        1000: "1000px",
        1200: "1200px",
        1400: "1400px",
      },
      height: {
        80: "80px",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: false,
    base: false,
  },
} satisfies Config;
