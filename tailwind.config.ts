import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        // Deep Focus & Creative Clarity — Surface hierarchy
        surface: {
          DEFAULT: "#0d1518",
          dim: "#0d1518",
          bright: "#323a3e",
          lowest: "#070f12",
          low: "#151d20",
          container: "#192124",
          high: "#232b2e",
          highest: "#2e3639",
        },
        "on-surface": {
          DEFAULT: "#dbe4e8",
          variant: "#c2c7c8",
        },
        // Primary — Forest Ink teal
        primary: {
          DEFAULT: "#b6cacc",
          dark: "#1a2c2e",
          container: "#1a2c2e",
          "on-container": "#809496",
        },
        "on-primary": "#213335",
        // Secondary — Soft Amber
        secondary: {
          DEFAULT: "#ffb95f",
          container: "#ee9800",
          "on-container": "#5b3800",
        },
        "on-secondary": "#472a00",
        // Tertiary — Electric Blue
        tertiary: {
          DEFAULT: "#adc6ff",
          container: "#00275c",
          "on-container": "#4c8dff",
        },
        "on-tertiary": "#002e6a",
        // Error
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
          "on-container": "#ffdad6",
        },
        // Utility
        outline: {
          DEFAULT: "#8c9292",
          variant: "#424848",
        },
        // Backward compat aliases
        text: "#eef2f4",
        subtext: "#a8b2b6",
        link: "#93b4ff",
        tag: "#6ee7b7",
        accent: "#fbbf24",
        muted: "#4a5560",
        base: "#0d1518",
        mantle: "#070f12",
        crust: "#050b0d",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic"',
          "Meiryo",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "Newsreader",
          '"Hiragino Mincho ProN"',
          '"Yu Mincho"',
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "display": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "editorial": ["2rem", { lineHeight: "1.3", fontWeight: "500" }],
        "reading": ["1.1875rem", { lineHeight: "1.6", fontWeight: "400" }],
        "ui-main": ["0.9375rem", { lineHeight: "1.333", fontWeight: "500" }],
        "ui-label": ["0.75rem", { lineHeight: "1.333", letterSpacing: "0.05em", fontWeight: "600" }],
        "ui-caption": ["0.8125rem", { lineHeight: "1.385", fontWeight: "400" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      spacing: {
        "unit": "4px",
        "xs": "4px",
        "18": "4.5rem",
        "gutter": "20px",
      },
      backdropBlur: {
        glass: "20px",
        "glass-heavy": "30px",
      },
      boxShadow: {
        glass: "0 0 40px rgba(26, 44, 46, 0.15)",
        glow: "0 0 12px rgba(182, 202, 204, 0.3)",
        "glow-amber": "0 0 12px rgba(255, 185, 95, 0.3)",
      },
      maxWidth: {
        reading: "720px",
      },
      width: {
        sidebar: "280px",
        inspector: "280px",
      },
    },
  },
  plugins: [],
};

export default config;
