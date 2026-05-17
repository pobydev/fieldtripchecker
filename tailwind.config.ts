import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "stormcloud-ink": "#282e3e",
        "quizlet-violet": "#4255ff",
        "sky-study": "#98e3ff",
        "flashcard-pink": "#eeaaff",
        "night-violet": "#423ed8",
        "practice-orange": "#ffc38c",
        "slate-text": "#586380",
        "light-slate": "#939bb4",
        "deep-slate": "#2e3856",
        "page-background": "#f6f7fb",
        "pure-white": "#ffffff",
        "ash-border": "#d9dde8",
        warning: "#b45309",
        danger: "#f26052",
      },
      boxShadow: {
        quizlet: "rgba(40, 46, 62, 0.1) 0px 4px 16px 0px",
        "quizlet-sm": "rgba(40, 46, 62, 0.1) 0px 2px 4px 0px",
        subtle: "rgba(0, 0, 0, 0.3) 0px 0px 1px 0px inset",
      },
      fontFamily: {
        quizlet: ["Pretendard", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
