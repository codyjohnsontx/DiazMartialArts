import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101214',
        ember: '#B42318',
        sand: '#F7F3ED',
        bronze: '#8A4B10',
        gold: '#D4A017',
        charcoal: '#1A1F26',
        clay: '#E9DFD5',
      },
      boxShadow: {
        ring: '0 10px 30px -12px rgba(16, 18, 20, 0.35)',
        soft: '0 8px 24px -14px rgba(16, 18, 20, 0.25)',
        lift: '0 18px 40px -24px rgba(16, 18, 20, 0.45)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // The dice on /dice while a roll is in flight. Time-based, so the
        // global prefers-reduced-motion block in app/globals.css neutralises
        // it; components/DiceRoller.tsx also applies it under `motion-safe:`.
        tumble: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(-5deg) scale(1.03)' },
          '50%': { transform: 'rotate(4deg) scale(0.98)' },
          '75%': { transform: 'rotate(-2deg) scale(1.01)' },
        },
      },
      animation: {
        rise: 'rise 650ms ease-out both',
        tumble: 'tumble 480ms ease-in-out both',
      },
    },
  },
  plugins: [],
};

export default config;
