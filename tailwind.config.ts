import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: "#f5c542",
        ink: "#000000",
        muted: "#5d5f5f",
        soft: "#777777",
        paper: "#f7f5ef",
        surface: "#f9f9f9",
      },
      fontFamily: {
        sans: ['"Pretendard"', '"Apple SD Gothic Neo"', "Noto Sans KR", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
