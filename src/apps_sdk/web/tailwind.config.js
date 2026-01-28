/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@openai/apps-sdk-ui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: "#FF5100",
        "primary-hover": "#ff6a26",
        accent: "#0f766e",
        success: "#047857",
        "success-hover": "#065f46",
      },
      boxShadow: {
        card: "0px 6px 14px rgba(0,0,0,0.06)",
        image: "0px 2px 6px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
