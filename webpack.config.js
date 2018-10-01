const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const dist = path.resolve(__dirname, "dist");
const src = path.resolve(__dirname, "src");

module.exports = {
  optimization: {
    minimize: false
  },
  target: "web",
  entry: {
    content: path.join(src, "content.js"),
    background: path.join(src, "background.js"),
    options: path.join(src, "options.js"),
    popup: path.join(src, "popup.js")
  },
  output: {
    filename: "[name].js",
    path: dist
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/options.html",
      filename: "options.html",
      chunks: ["options"]
    }),
    new HtmlWebpackPlugin({
      template: "src/popup.html",
      filename: "popup.html",
      chunks: ["popup"]
    }),
    new CopyWebpackPlugin([
      {
        from: "./src/manifest.json",
        to: dist
      },
      {
        from: "./src/images",
        to: path.join(dist, "images")
      }
    ])
  ]
};
