import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#12633D",
          dark: "#084D2D",
          gold: "#C7A84A",
        },
        canvas: "#FAFAF8",
        ink: "#1D1D1F",
        muted: "#6B6B6B",
        line: "#E8E8E5",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(8, 77, 45, 0.08)",
        card: "0 10px 24px rgba(29, 29, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
