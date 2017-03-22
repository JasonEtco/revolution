const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const { browsers } = require('./browser');

module.exports = {
  entry: [
    path.resolve(__dirname, '..', 'app', 'main.js'),
  ],
  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: '[name]-[hash].min.js',
    publicPath: '/',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '..', 'app', 'index.tpl.html'),
      inject: 'body',
      filename: 'index.html',
    }),
    new ExtractTextPlugin('[name]-[hash].min.css'),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true,
      },
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new CopyWebpackPlugin([
      {
        context: path.join(__dirname, '..', 'app'),
        from: 'assets',
        to: 'assets',
        ignore: ['fonts/**/*'],
      },
    ]),
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: [['env', { targets: { browsers } }], 'es2015', 'stage-0', 'react'],
        plugins: ['transform-runtime'],
      },
    }, {
      test: /\.json/,
      loader: 'json',
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader!postcss-loader?sourceMap']),
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: [
        'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false',
      ],
    }, {
      test: /\.(eot|svg|ttf|woff?)$/,
      loader: 'file-loader?name=assets/fonts/[name].[ext]',
    }, {
      test: /\.(mp3|mp4|webm)$/,
      loader: 'file-loader?name=assets/[name].[ext]',
    }],
  },
  postcss: [
    autoprefixer({ browsers }),
  ],
  sassLoader: {
    data: '@import "tools";',
    includePaths: [
      path.resolve(__dirname, '..', 'app', 'scss', 'tools'),
    ],
  },
};
