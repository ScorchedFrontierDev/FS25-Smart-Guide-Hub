import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // FS25 brand palette
        field:   { DEFAULT: '#4a7c3f', light: '#6aab61', dark: '#2d5227' },
        harvest: { DEFAULT: '#c8892a', light: '#e6a93e', dark: '#8a5c0f' },
        soil:    { DEFAULT: '#6b4226', light: '#8a5a3a', dark: '#3d2010' },
        sky:     { DEFAULT: '#3b7bbf', light: '#5a9fd4', dark: '#1e4f80' },
        night:   { DEFAULT: '#0f1a0e', light: '#1a2e19', dark: '#080f07' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
