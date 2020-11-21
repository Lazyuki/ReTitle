module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/env',
        {
          targets:
            'last 5 chrome version, last 5 firefox version, edge >= 84, chrome 49',
        },
      ],
      [
        '@babel/preset-react',
        {
          pragma: 'h',
          pragmaFrag: 'Fragment',
        },
      ],
      [
        '@babel/preset-typescript',
        {
          allExtensions: true,
          isTSX: true,
          jsxPragma: 'h',
        },
      ],
    ],
    plugins: ['@babel/plugin-proposal-class-properties'],
  };
};
