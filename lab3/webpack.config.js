const path = require('path');
const webpack = require('webpack');

// const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/index.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public', 'assets'),
    },
    devServer: {
      contentBase: './public',
      port: 3000,
      disableHostCheck: true,
      watchContentBase: true,
      publicPath: '/assets/'
    },
    devtool: 'inline-source-map',
    plugins: [
      // new HtmlWebpackPlugin(),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
    ],
    module: {
        rules: [
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          },
          {
            test: /\.js$/, 
            exclude: /node_modules/, 
            loader: "babel-loader" 
          },
          {
            // HTML LOADER
            // Reference: https://github.com/webpack/raw-loader
            // Allow loading html through js
            test: /\.html$/,
            loader: 'raw-loader'
          },
          {
            test: /\.(png|svg|jpg|gif)$/,
            loader: 'file-loader'
          }
        ]
    }
};
