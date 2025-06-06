const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: false,
  devServer: {
    static: {
      directory: __dirname,
    },
    compress: true,
    port: 8080,
    open: true,
    hot: false,
    liveReload: false,
  },
});
