import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        base: {
          DEFAULT: "#090B10",
          surface: "#12151D",
          elevated: "#171B26",
          border: "#232838",
        },
        accent: {
          DEFAULT: "#C8FF4D",
          dim: "#8FB83A",
          soft: "rgba(200,255,77,0.12)",
        },
        indigo: {
          DEFAULT: "#6E8BFF",
          soft: "rgba(110,139,255,0.14)",
        },
        amber: {
          DEFAULT: "#FFB84D",
          soft: "rgba(255,184,77,0.14)",
        },
        rose: {
          DEFAULT: "#FF6E6E",
          soft: "rgba(255,110,110,0.14)",
        },
        ink: {
          DEFAULT: "#EDEFF4",
          muted: "#9AA1B2",
          faint: "#5C6377",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(200,255,77,0.25), 0 0 40px -8px rgba(200,255,77,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
