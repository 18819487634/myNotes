var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var baseWebpackConfig = require('./webpack.base.config')
var CompressionWebpackPlugin = require('compression-webpack-plugin')
var SentryPlugin = require('webpack-sentry-plugin')
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
var CdnPathWebpackPlugin = require('html-webpack-cdn-path-plugin')
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
var { sentry, resolve, WebVersion, vueLoader, cdnPath, cdnHashDate, cdnProjectName } = require('./config/index')

var prod = {
  entry: {
    app: path.resolve(__dirname, '../src/main.js'),
    vendors: [
      'vue',
      'vue-router',
      'axios',
      'vuex',
      'lodash'
      // 'wurl'
    ]
  },
  output: {
    /* 输出目录，没有则新建 */
    // path: path.resolve(__dirname, './dist'),
    /* 静态目录，可以直接从这里取文件 */
    // publicPath: '/',
    publicPath: '/pc/resource/',
    /* 文件名 */
    filename: `${cdnProjectName}/[name].${cdnHashDate}.[hash:8].js`,
    // filename: `[name].[hash:8].js`,
    chunkFilename: `${cdnProjectName}/chunks/[name].[id].${cdnHashDate}.[hash:8].js`
    // chunkFilename: `chunks/[name].[id].[hash:8].js`
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoader
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          }
        })
        // exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
        UPDAY_ENV: '"' + process.env.UPDAY_ENV + '"',
        HASH: '"' + sentry.hash + '"',
        SENTRY_DSN: '"' + sentry.dsn + '"'
      }
    }),
    // 作用域提升
    new webpack.optimize.ModuleConcatenationPlugin(),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: '"production"'
    //   }
    // }),
    // 一定要加上这个 LoaderOptionsPlugin 并且这样设置，才能让上传到 sentry 的 sourceMap 生效
    // TODO 后面再研究到底是什么问题
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      // debug: false,
      sourceMap: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      // https://github.com/mishoo/UglifyJS2#usage
      compress: {
        warnings: false,
        drop_console: true
      },
      output: {
        comments: false
      },
      sourceMap: true
    }),

    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendors'],
      // 随着 入口chunk 越来越多，这个配置保证没其它的模块会打包进 公共chunk
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    // new webpack.BannerPlugin({ banner: banner }),
    // new ExtractTextPlugin('[name].[hash:8].css'),
    new ExtractTextPlugin({
      filename: `${cdnProjectName}/[name].${cdnHashDate}.[contenthash].css`,
      // filename: `[name].[hash:8].css`,
      disable: false,
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      favicon: path.resolve(__dirname, '../src/favicon.ico'),
      // https://github.com/ampedandwired/html-webpack-plugin#configuration
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.html'),
      inject: true,
      minify: {
        // https://github.com/kangax/html-minifier#options-quick-reference
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true
        // removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency',
      // // custom args
      // // @use htmlWebpackPlugin.options.xxx
      // // cnzz: CNZZ,
      WebVersion: WebVersion
    }),
    // gzip 压缩
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerHost: 'localhost',
    //   analyzerPort: 8123,
    //   openAnalyzer: false
    // })
    new CdnPathWebpackPlugin({
      runtimeCdnPath: cdnPath.length ? [cdnPath[0]] : [],
      assetsJsCdnPath: cdnPath,
      assetsCssCdnPath: cdnPath
    })
    // https://github.com/vuejs/vue-hackernews-2.0/issues/79
    // new webpack.ProvidePlugin({
    //   Promise: 'es6-promise'
    // })
    // new BundleAnalyzerPlugin()
  ],
  // debug: false,
  devtool: 'source-map'
  // sourceMap: false
}

// if (process.env.NODE_ENV === 'production') {
//   prod.plugins.push(
//     new SentryPlugin({
//       // Sentry options are required
//       organisation: sentry.organisation, // 取 short name
//       project: sentry.project,
//       apiKey: sentry.apiKey,
//       baseSentryURL: sentry.baseSentryURL,
//       exclude: /\.html$/,
//       filenameTransform: function (filename) {
//         return '~/' + filename
//       },
//       suppressErrors: false,
//       deleteAfterCompile: true,
//       // Release version name/hash is required
//       release: sentry.hash
//     })
//   )
// }

module.exports = merge(baseWebpackConfig, prod)
