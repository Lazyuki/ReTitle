module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/env',
        {
          targets:
            'last 5 chrome version, last 5 firefox version, chrome 49, edge >= 84',
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
  };
};
