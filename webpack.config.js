const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin');
const baseManifest = require('./manifest.base.json');
const pkg = require('./package.json');
const CopyPlugin = require('copy-webpack-plugin');

const dev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: dev ? "development" : "production",
  devtool: dev ? 'cheap-source-map' : undefined,
  entry: {
    popup: './src/popup/index.tsx',
    options: './src/options/index.tsx',
    background: './src/background.ts'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist',
    pathinfo: true

  },
  module: {
    rules: [{
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: ['babel-loader']
      },
      {
        test: /\.(png|svg)$/,
        exclude: /node_modules/,
        loader: ['file-loader']
      }
    ]
  },
  plugins: [
    new WebpackExtensionManifestPlugin({
      config: {
        base: baseManifest,
        extend: {
          version: pkg.version
        }
      }
    }),
    new CopyPlugin([{
      from: 'static',
    }]),

  ],
  resolve: {
    extensions: ['.js', 'jsx', '.ts', '.tsx'],
    alias: {
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    },

  }
};