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
        // Catppuccin Mocha-ish — Obsidian-friendly dark palette
        base: "#1e1e2e",
        mantle: "#181825",
        crust: "#11111b",
        text: "#cdd6f4",
        subtext: "#a6adc8",
        overlay: "#6c7086",
        link: "#89b4fa",
        tag: "#a6e3a1",
        accent: "#f5c2e7",
        muted: "#45475a",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic"',
          "Meiryo",
          "system-ui",
          "sans-serif",
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
        base: ["1rem", { lineHeight: "1.75" }],
      },
    },
  },
  plugins: [],
};

export default config;
