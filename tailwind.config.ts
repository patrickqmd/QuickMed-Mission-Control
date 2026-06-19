import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18201d",
        line: "#d9ded7",
        field: "#f7f8f5",
        brand: "#176b5b",
        warn: "#b65327",
        urgent: "#b3261e"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(24, 32, 29, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
