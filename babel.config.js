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
	const assumptions = {
		"setPublicClassFields": true
	};
  const plugins = [
		"@babel/plugin-syntax-jsx",
		["@babel/plugin-transform-typescript", {"allowDeclareFields": true}],
		["@babel/plugin-proposal-decorators", { "legacy": true }],
		["@babel/plugin-proposal-class-properties"]
	];
  return {
    presets,
    plugins
  };
}
