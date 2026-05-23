import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          navy: "#111827",
          slate: "#1F2937",
          emerald: "#10B981"
        }
      }
    }
  },
  plugins: []
};

export default config;
