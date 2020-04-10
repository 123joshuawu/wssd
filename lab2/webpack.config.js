const path = require('path');
const webpack = require('webpack');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
      contentBase: './dist',
      host: '0.0.0.0',
      port: 8080,
      disableHostCheck: true,
    },
    devtool: 'inline-source-map',
    plugins: [
      new MomentLocalesPlugin(),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
    ],
    module: {
        rules: [
          {
            test: /\/js$/,
            exclude: /node_modules/,
            loader: "eslint-loader",
            options: {
              cache: true
            }
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          },
          {
            test: /\.js$/, 
            exclude: /node_modules/, 
            loader: "babel-loader" 
          }
        ]
    }
};