
const CopyWebpackPlugin = require("copy-webpack-plugin")
const plugins = require('./webpack.plugins');
const path = require('path');

plugins.push(new CopyWebpackPlugin({
  patterns: [
    {
      from: path.resolve(__dirname, "node_modules/fast-folder-size/bin"),
      to: path.resolve(__dirname, ".webpack/main/bin")
    }
  ]
}))

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
  }
}