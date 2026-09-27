import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#FAF4F0',
          dark: '#F3E9E0',
        },
        paper: {
          DEFAULT: '#FFFDF9',
          pink: '#F9E2E7',
          rose: '#F3CCD5',
        },
        maroon: {
          DEFAULT: '#4A1E28',
          accent: '#6B2D39',
          light: '#8A4151',
        },
        vintage: {
          rosegold: '#D8A7B1',
          brass: '#C89D66',
          gold: '#E3BE86',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'scrapbook': '4px 6px 0px 0px rgba(216, 167, 177, 0.45), 0 10px 15px -3px rgba(74, 30, 40, 0.06)',
        'scrapbook-pink': '4px 6px 0px 0px rgba(200, 157, 102, 0.35), 0 10px 15px -3px rgba(74, 30, 40, 0.06)',
        'polaroid': '0 8px 24px -4px rgba(74, 30, 40, 0.15), 0 2px 6px -1px rgba(74, 30, 40, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
