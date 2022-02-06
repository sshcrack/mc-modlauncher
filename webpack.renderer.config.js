const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin")

const assets = [ "assets"]

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push(
  {
    test: /\.(scss)$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: function () {
              return [
                require('autoprefixer')
              ];
            }
          }
        }
      },
      {
        loader: 'sass-loader'
      }
    ]
  }, {
  test: /\.(png|jpe?g|gif|ico|svg)$/,
  use: [
    {
      loader: "file-loader",
    }
  ]
},
);

plugins.push(new CopyWebpackPlugin({
  patterns: assets.map(asset => {
    return {
      from: path.resolve(__dirname, "src", asset),
      to: path.resolve(__dirname, ".webpack/renderer", asset)
    }
  })
}))


module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', ".scss"]
  },
};
