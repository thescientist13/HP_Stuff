module.exports = function (api) {
  api.cache(true);
  const presets = [
    [
			require("@babel/preset-env"),
			{
				useBuiltIns: 'entry',
				corejs: 3
			},
			"@babel/preset-typescript",
			"@babel/plugin-syntax-jsx"
		]
  ]
  const plugins = [];
  return {
    presets,
    plugins
  };
}
