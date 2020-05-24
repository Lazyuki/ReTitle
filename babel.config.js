module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/env',
        {
          targets: '> 0.25%',
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