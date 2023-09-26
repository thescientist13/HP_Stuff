const starlightPlugin = require('@astrojs/starlight-tailwind');
const fontawesome = require('tailwind-fontawesome');
const typography = require('@tailwindcss/typography');

// Generated color palettes
const accent = { 200: '#a2ccff', 600: '#006bc6', 900: '#003262', 950: '#002449' };
const gray = { 100: '#f1f7fc', 200: '#e2f0f9', 300: '#b4c5cf', 400: '#7090a5', 500: '#3e5c6f', 700: '#1e3c4d', 800: '#0b2a3b', 900: '#0d1a22' };
const transparent = 'transparent';
const lochmara = {
  '50': '#f0f9ff',
  '100': '#e1f3fd',
  '200': '#bce6fb',
  '300': '#81d5f8',
  '400': '#3ebff2',
  '500': '#15a7e2',
  '600': '#0885bf',
  '700': '#086b9c',
  '800': '#0b5b81',
  '900': '#0f4b6b',
  '950': '#0a3047',
};


module.exports = {
  syntax: 'postcss-lit',
  content: {
    files: ['./src/components/**/*.{js,ts}'],
  },
  theme: {
    extend: {
      colors: { accent, lochmara, gray, transparent },
    },
  },
  plugins: [
    starlightPlugin(),
		typography(),
    fontawesome({
      version: 6
    }),
  ],
};
