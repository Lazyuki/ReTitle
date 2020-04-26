const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin');
const baseManifest = require('./manifest.base.json');
const pkg = require('./package.json');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const dev = process.env.NODE_ENV !== 'production';
const browser = process.env.BROWSER || 'chrome';

module.exports = {
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
        use: [
          { loader: 'babel-loader' },
          {
            loader: 'string-replace-loader',
            options: {
              search: '__extension_version__',
              replace: dev ? `${pkg.version}-dev` : pkg.version,
            },
          },
          { loader: 'webpack-conditional-loader' },
        ],
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        use: ['preact-svg-loader'],
      },
    ],
  },
  plugins: [
    new WebpackExtensionManifestPlugin({
      config: {
        base: baseManifest,
        extend: {
          version: pkg.version,
        },
      },
    }),
    new CopyPlugin([
      {
        from: 'static',
        exclude: 'static/svgs',
      },
    ]),
    dev
      ? null
      : new ZipPlugin({
          path: '../zip',
          filename: `ReTitle-${pkg.version}.${browser}.zip`,
        }),
  ],
  resolve: {
    extensions: ['.js', 'jsx', '.ts', '.tsx'],
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
    },
  },
};
