const path = require('path');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pagesToCompile = require('./pages-to-compile');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');
const pagesDir = path.join(__dirname, '../src/pages');

const getPages = () => {
  let pages = fs.readdirSync(pagesDir);

  if (pagesToCompile.pages && pagesToCompile.pages.length) {
    pages = pagesToCompile.pages
  };

  if (pagesToCompile.exclude && pagesToCompile.exclude.length) {
    return pages.filter((page) => !pagesToCompile.exclude.includes(page));
  }

  return pages;
}

const generatedPages = getPages().map(pageName => {
  return new HtmlWebpackPlugin({
    filename: `${pageName}.html`,
    template: path.join(pagesDir, `${pageName}/${pageName}.pug`),
    inject: true,
    cache: false,
    minify: {
      removeComments: true,
      collapseWhitespace: true
    }
  })
});

module.exports = {
  entry: {
    bundle: path.join(srcDir, 'app.js')
  },

  output: {
    path: path.join(distDir),
    filename: 'js/[name].[contenthash:7].js',
    publicPath: '/'
  },

  module: {
    rules: [{
        test: /\.pug$/,
        use: {
          loader: 'pug-loader',
        }
      },

      {
        test: /\.(png|jpe?g|gif|ico|webp)$/,
        use: [{
          loader: 'url-loader',
          options: {
            name: 'assets/images/[name].[contenthash:7].[ext]',
            limit: 8192
          }
        }]
      },
      {
        test: /\.svg$/,
        exclude: [
          path.join(__dirname, '../src/assets/fonts')
        ],
        oneOf: [{
            loader: 'svg-url-loader',
            resourceQuery: /inline/,
          },
          {
            loader: 'svg-sprite-loader',
            resourceQuery: /sprite/,
            options: {
              symbolId: filePath => path.basename(filePath, '.svg'),
              spriteFilename: 'assets/images/sprite.[contenthash:7].svg',
            }
          },
          {
            loader: 'file-loader',
            resourceQuery: /image/,
            options: {
              name: 'assets/images/[name].[contenthash:7].[ext]',
            }
          }
        ]
      },

      {
        test: /\.(mp4|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'assets/media/[name].[contenthash:7].[ext]',
          }
        }]
      },
      {
        test: /\.(eot|otf|svg|ttf|woff|woff2)$/,
        include: path.join(__dirname, '../src/assets/fonts'),
        use: [
          {
            loader: 'file-loader',
            options: {
              context: path.join(__dirname, '../src/assets/fonts'),
              name: 'assets/fonts/[path][name].[ext]'
            }
          }
        ]
      },
    ]
  },
  plugins: [
    ...generatedPages,
    new SpriteLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:7].css',
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
    }),
    new CleanWebpackPlugin({
      verbose: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, '../src/assets/favicons'),
          to: path.join(__dirname, '../dist/assets/favicons')
        }
      ]
    })

  ],
  resolve: {
    alias: {
      '~node-modules': path.join(__dirname, '../node_modules'),
      '~dev-tools': path.join(__dirname, '../dev-tools'),
      '~src': path.join(__dirname, '../src'),
      '~pages': path.join(__dirname, '../src/pages'),
      '~blocks': path.join(__dirname, '../src/blocks'),
      '~scss': path.join(__dirname, '../src/common/scss'),
      '~pug': path.join(__dirname, '../src/common/pug'),
      '~js': path.join(__dirname, '../src/common/js'),
      '~css': path.join(__dirname, '../src/common/css'),
      '~images': path.join(__dirname, '../src/assets/images'),
      '~assets': path.join(__dirname, '../src/assets'),
    }
  },
};