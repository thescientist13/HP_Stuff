const {tailwindTransform} = require('postcss-lit');
const starlightPlugin = require('@astrojs/starlight-tailwind');
const fontawesome = require('tailwind-fontawesome');

module.exports = {
  content: {
    files: ['./*.js'],
    transform: {
      ts: tailwindTransform
    }
  },
	plugins: [
		starlightPlugin(),
		fontawesome({
			version: 6
		})
	],
};
