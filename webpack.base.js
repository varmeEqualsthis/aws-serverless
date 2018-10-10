// var path = require("path");

// module.exports = {
//   target: "node",
//   node: {
//     __dirname: false
//   },
//   module: {
//     rules: [{ test: /\.tsx?$/, loader: "awesome-typescript-loader" }]
//   },
//   resolve: {
//     extensions: [".ts", ".tsx", ".js", ".jsx"]
//   },
//   output: {
//     libraryTarget: "commonjs",
//     path: path.join(__dirname, ".webpack"),
//     filename: "handler.js"
//   }
// };
const path = require("path");
const slsw = require("serverless-webpack");

const entries = {};

Object.keys(slsw.lib.entries).forEach(
  key => (entries[key] = ["./source-map-install.js", slsw.lib.entries[key]])
);

module.exports = {
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  entry: entries,
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "handler.js"
  },
  target: "node",
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  }
};
