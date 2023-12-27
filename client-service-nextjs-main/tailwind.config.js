/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./public/index.html",
    "./app/**/*.{html,js,ts,jsx,tsx}",
    "./pages/**/*.{html,js,ts,jsx,tsx}",
    "./components/**/*.{html,js,ts,jsx,tsx}",
    "./layout/**/*.{html,js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        denim: "#0662C7",
        gray: {
          1: "#EEEEEE",
          2: "#FAFAFA",
          3: "#00000040",
        },
        blue: {
          1: "#13294b",
          2: "#0762c8",
        },
        neutral: {
          1: "#00162E",
          2: "#4B5A6A",
          3: "#7E8C9C",
          4: "#9DAAB8",
          5: "#CCD1D7",
          7: "#F9F9FB",
        },
        xanth: "#FFC160",
        buyer: "#00CFE1",
        error: "#FA657E",
        success: "#27C196",
        "alice-blue": "#DBE1E8",
        warning: { 1: "#FFDA49", 2: "#ffda4914" },
        disabled: "#F8FAFB",
        "white-smoke": "#F6F6F6",
        "white-smoke-2": "#EEEEEE",
        "alice-blue-2": "#F0F8FF",
        "san-marino": "#4B72A4",
        cyprus: "#13294B",
      },
      fontFamily: {
        "sharp-sans": ["sharp-sans", "sans-serif"],
        "sharp-sans-medium": ["sharp-sans-medium", "sans-serif"],
        "sharp-sans-semibold": ["sharp-sans-semibold", "sans-serif"],
        "sharp-sans-bold": ["sharp-sans-bold", "sans-serif"],
        montserrat: ["montserrat", "montserrat"],
        "montserrat-medium": ["montserrat-medium", "montserrat"],
        "montserrat-semibold": ["montserrat-semibold", "montserrat"],
        "montserrat-bold": ["montserrat-bold", "montserrat"],
      },
      boxShadow: {
        default:
          "0px 4px 16px rgba(157, 170, 184, 0.3), 0px 4px 12px rgba(157, 170, 184, 0.3), 0px 2px 4px rgba(157, 170, 184, 0.3)",
      },
      fontSize: {
        xxs: ["10px", "13px"],
        xs: ["0.75rem", "1.125rem"], // font-size: 12px line-height: 18px
        ssm: ["0.813rem", "1.125rem"], // font-size: 13px line-height: 18px
        sm: ["0.875rem", "1.125rem"], // font-size: 14px line-height: 18px
        base: ["1rem", "1.3125rem"], // font-size: 16px line-height: 21px
        "header-5": ["1.25rem", "1.5625rem"], // font-size: 20px line-height: 25px
        subheader: ["1.5625rem", "1.875rem"],
        "body-2": ["1.125rem", "1.6875rem"], // font-size: 18px line-height: 27px
        "body-3": ["1rem", "1.625rem"], // font-size: 16px line-height: 26px
        "body-4": ["0.875rem", "1.3125rem"], // font-size: 14px line-height: 21px
        lg: ["1.125rem", "1.5rem"], // font-size: 18px line-height: 24px
        "4xl": ["2.5rem", "3rem"], // font-size: 40px line-height: 48px
        "5xl": ["3rem", "3.75rem"], // font-size: 48px line-height: 60px
        "6xl": ["3.063rem", "3.688rem"], // font-size: 49px line-height: 59px
      },
    },
  },
  plugins: [],
};
