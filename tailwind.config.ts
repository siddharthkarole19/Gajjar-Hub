import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          start: "#222223",
          end: "#131314",
        },
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.04)",
          hover: "rgba(255, 255, 255, 0.06)",
          active: "rgba(255, 255, 255, 0.08)",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.10)",
          divider: "rgba(255, 255, 255, 0.08)",
        },
        text: {
          DEFAULT: "#E5E7EB",
          muted: "#9CA3AF",
          dim: "#6B7280",
        },
        primary: {
          DEFAULT: "#6B95FF",
          dark: "#0D1224",
          border: "#1F2A4D",
          hover: "#5a84ee",
        },
        amber: {
          DEFAULT: "#E6A835",
          hover: "#d59728",
        },
        status: {
          success: "#4ADE80",
          danger: "#F87171",
          open: "#E6A835",
          inProgress: "#6B95FF",
          resolved: "#4ADE80",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "primary-glow": "0 0 32px rgba(107, 149, 255, 0.35)",
        "card-subtle": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        card: "20px",
        btn: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
