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
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#102a43',
          900: '#0b1d3a',
          950: '#061021',
        },
        safeguard: {
          primary: '#0284c7',   // Sky blue 600
          accent: '#0369a1',    // Sky blue 700
          navy: '#0b192c',      // Dark navy
          alert: '#10b981',     // Green (Alert state)
          drowsy: '#f59e0b',    // Amber (Drowsy state)
          danger: '#ef4444',    // Red (Highly drowsy / Emergency)
          card: '#1e293b',      // Slate 800
          cardBorder: '#334155',// Slate 700
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Telugu', 'system-ui', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

