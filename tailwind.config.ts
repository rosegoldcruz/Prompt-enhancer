import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        base: "#09090B",
        surface: "#111114",
        card: "#18181B",
        gold: "#D4A237",
        rose: "#C08497",
        muted: "#A1A1AA"
      },
      boxShadow: {
        luxury: "0 10px 35px rgba(212,162,55,0.12)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 20% 10%, rgba(212,162,55,0.2), transparent 30%), radial-gradient(circle at 80% 15%, rgba(192,132,151,0.18), transparent 35%), linear-gradient(180deg, #09090B 0%, #0F0F12 100%)"
      }
    }
  },
  plugins: []
};

export default config;
