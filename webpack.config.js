const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  optimization: {
    minimize: false
  },
  target: "web",
  entry: {
    content: "./src/content.js",
    background: "./src/background.js",
    options: "./src/options.js",
    popup: "./src/popup.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
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
        to: path.resolve(__dirname, "dist")
      },
      {
        from: "./src/images",
        to: path.resolve(__dirname, "dist", "images")
      }
    ])
  ]
};
