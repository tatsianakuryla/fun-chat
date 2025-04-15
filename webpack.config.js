const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './fun-chat/src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'fun-chat/dist'),
    clean: true,
  },
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: path.resolve(__dirname, 'fun-chat/dist'),
    hot: true,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@components': path.resolve(__dirname, 'fun-chat/src/components'),
      '@api': path.resolve(__dirname, 'fun-chat/src/api'),
      '@core': path.resolve(__dirname, 'fun-chat/src/core'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './fun-chat/src/index.html',
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: './fun-chat/public/favicon.png',
    //       to: 'favicon.png',
    //     },
    //   ],
    // }),
  ],
};
