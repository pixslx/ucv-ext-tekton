const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const config = {
  context: __dirname,
  devtool: 'nosources-source-map',
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  node: {
    fs: 'empty',
    __dirname: false,
    __filename: false
  },
  externals: [nodeExternals()],
  entry: {
    'ucv-ext-sdk-template-runnable': ['./src/index-runnable.js']
  },
  optimization: {
    minimize: false
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: [/\.jsx$/, /\.js$/],
        exclude: /node_modules/,
        use: [
          'babel-inline-import-loader',
          {
            loader: 'babel-loader',
            query: {
              cacheDirectory: false,
              sourceMap: true,
              compact: false
            }
          }
        ]
      }
    ],
    noParse: [
      // don't parse minified bundles (vendor libs) for faster builds
      /\.min\.js$/
    ]
  },
  output: {
    filename: '[name].min.js',
    path: process.env.APP_DIST_DIR || path.join(__dirname, `${process.env.NODE_ENV === 'production' ? 'dist' : 'build'}-runnable`)
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  ],
  resolveLoader: {
    modules: [path.join(__dirname, 'node_modules')]
  }
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          passes: 2,
          unused: false
        },
        mangle: process.env.BUILD_ENV === 'production'
      },
      sourceMap: true
    })
  )
}

module.exports = config
