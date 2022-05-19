module.exports = function (api) {
  api.cache(true);
  const presets = [
    [
			"@babel/preset-env",
			{
				useBuiltIns: 'entry',
				corejs: 3
			},
			"@babel/preset-typescript",
		]
  ]
  const plugins = [
			"@babel/plugin-syntax-jsx"
	];
  return {
    presets,
    plugins
  };
}
