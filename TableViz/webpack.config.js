const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/customVis.js",
  devServer: {
    static: "./dist",
    https: true,
    port: 8080,
  },
  output: {
    filename: "custom_table.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        use: "babel-loader",
        exclude: /node_modules/,
        include: /src/,
        sideEffects: false,
      },
      { test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },

    ],
  },
  resolve: {
    extensions: [".jsx", ".js", ".css"],
    fallback: { buffer: false },
  },
  devtool: "source-map",
};
