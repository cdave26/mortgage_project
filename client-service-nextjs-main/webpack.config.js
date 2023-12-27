const webpack = require('webpack');
const path = require('path');
module.exports = {
  mode: 'production',
  entry: {
    sw: [path.resolve(__dirname, 'plugins', 'service-worker.js')],
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [],
};
