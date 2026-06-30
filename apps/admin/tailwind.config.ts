import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#F5F6FB",
        surface: "#FFFFFF",
        ink: "#0E1116",
        dark: "#0E1116",
        primary: "#2563EB",
        secondary: "#7C3AED",
        accent: "#FF2E7E",
        sun: "#FF7A1A",
        muted: "#5B6472",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 50px -20px rgba(37, 99, 235, 0.45)",
        "glow-purple": "0 20px 50px -20px rgba(124, 58, 237, 0.45)",
        soft: "0 10px 40px -12px rgba(14, 17, 22, 0.12)",
        "soft-lg": "0 24px 60px -20px rgba(14, 17, 22, 0.18)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(14,17,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,17,22,0.05) 1px, transparent 1px)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-30px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        streak: {
          "0%": { transform: "translateX(-10%)", opacity: "0" },
          "50%": { opacity: "0.7" },
          "100%": { transform: "translateX(110%)", opacity: "0" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        dash: { to: { strokeDashoffset: "-1000" } },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg) scale(1.12)" },
          "25%": { transform: "rotate(-9deg) scale(1.12)" },
          "75%": { transform: "rotate(9deg) scale(1.12)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 3s linear infinite",
        marquee: "marquee 28s linear infinite",
        "marquee-reverse": "marquee-reverse 28s linear infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        dash: "dash 18s linear infinite",
        streak: "streak 7s ease-in-out infinite",
        wiggle: "wiggle 0.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
