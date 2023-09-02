// eslint-disable-next-line notice/notice
const path = require("path");

module.exports = {
  target: "node",
  mode: "production",
  entry: "./src/runner.ts", // Change the entry point to TypeScript file
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {}
  },
  externals: {},
  optimization: {
    usedExports: true
  }
};
