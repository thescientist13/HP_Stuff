const {tailwindTransform} = require('postcss-lit');
const starlightPlugin = require('@astrojs/starlight-tailwind');
const fontawesome = require('tailwind-fontawesome');

// Generated color palettes
const accent = { 200: '#a2ccff', 600: '#006bc6', 900: '#003262', 950: '#002449' };
const gray = { 100: '#f1f7fc', 200: '#e2f0f9', 300: '#b4c5cf', 400: '#7090a5', 500: '#3e5c6f', 700: '#1e3c4d', 800: '#0b2a3b', 900: '#0d1a22' };
const transparent = 'transparent';

module.exports = {
  syntax: 'postcss-lit',
  content: {
    files: ['./src/components/**/*.{js,ts}'],
    transform: {
      ts: tailwindTransform
    }
  },
  theme: {
    extend: {
      colors: { accent, gray, transparent },
    },
  },
  plugins: [
    starlightPlugin(),
    fontawesome({
      version: 6
    })
  ],
};
