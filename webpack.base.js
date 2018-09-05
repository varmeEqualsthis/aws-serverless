var path = require("path");

module.exports = {
  target: "node",
  node: {
    __dirname: false
  },
  module: {
    loaders: [{ test: /\.tsx?$/, loader: "awesome-typescript-loader" }]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "handler.js"
  }
};
