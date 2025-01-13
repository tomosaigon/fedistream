import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  safelist: [
    {
      pattern: /bg-(blue|yellow|amber|red|green|purple)-(300|400|500|600)/,
    },
    {
      pattern: /hover:bg-(blue|yellow|amber|red|green|purple)-(600)/,
    },
    'disabled:bg-gray-400',
  ],
  plugins: [],
} satisfies Config;
