const webpack = require('webpack');
const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const baseManifest = require('./manifest.base.json');
const pkg = require('./package.json');

const firefoxManifestSettings = {
  browser_specific_settings: {
    gecko: {
      id: '{15fcc312-c0d6-4d8a-add7-edf49088fefd}',
      strict_min_version: '42.0',
    },
  },
};

module.exports = (env) => {
  const dev = env.NODE_ENV !== 'production';
  const browser = env.BROWSER || 'chrome';

  return {
    mode: dev ? 'development' : 'production',
    devtool: dev ? 'cheap-source-map' : undefined,
    entry: {
      popup: './src/popup/index.tsx',
      options: './src/options/index.tsx',
      background: './src/background.ts',
    },
    output: {
      filename: '[name].js',
      path: __dirname + `/dist_${browser}`,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [{ loader: 'babel-loader' }],
        },
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          use: ['preact-svg-loader'],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        BROWSER: JSON.stringify(browser),
        EXTENSION_VERSION: JSON.stringify(
          dev ? `${pkg.version}-dev` : pkg.version
        ),
      }),
      new WebpackExtensionManifestPlugin({
        config: {
          base: baseManifest,
          extend: {
            version: pkg.version,
            ...(browser === 'firefox' ? firefoxManifestSettings : {}),
          },
        },
      }),
      new CopyPlugin([
        {
          from: 'static',
          ignore: ['svgs/*'], // SVGs get bundled in directly
        },
      ]),
      !dev &&
        new ZipPlugin({
          path: '../zip',
          filename: `ReTitle-${pkg.version}.${browser}.zip`,
        }),
    ].filter(Boolean),
    resolve: {
      extensions: ['.js', 'jsx', '.ts', '.tsx'],
      alias: {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      },
    },
  };
};
