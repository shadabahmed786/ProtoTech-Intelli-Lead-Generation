import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1220",
        surface: "#121A2B",
        "surface-raised": "#162035",
        "surface-hover": "#1C2840",
        border: "#1E2A3A",
        "border-subtle": "#162232",
        "border-focus": "#00E5FF",
        primary: {
          DEFAULT: "#00E5FF",
          dark: "#00A3FF",
          light: "#4DE3FF",
          muted: "rgba(0, 229, 255, 0.12)",
        },
        secondary: {
          DEFAULT: "#00C896",
          dark: "#009E75",
          light: "#4FFFC7",
          muted: "rgba(0, 200, 150, 0.12)",
        },
        accent: {
          DEFAULT: "#4DE3FF",
          dark: "#00A3FF",
        },
        text: {
          primary: "#E6F1FF",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        error: {
          DEFAULT: "#FF4D6D",
          muted: "rgba(255, 77, 109, 0.12)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          muted: "rgba(245, 158, 11, 0.12)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
