const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "development",
  devtool: "cheap-module-source-map",
  entry: {
    Assembler: "./assembler/Assembler.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  // devServer: {
  //   // hot: true,
  //   open: true,
  // },
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     template: "./src/index.html",
  //   }),
  // ],
};
