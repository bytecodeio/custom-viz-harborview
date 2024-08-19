const path = require("path");

module.exports = {
  entry: {
    bar: "./src/customBarVis.tsx",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true
          }
        }
      ],
      exclude: /node_modules/,
    },
    {
      test: /\.(js|jsx)$/i,
      use: "babel-loader",
      exclude: /node_modules/,
      include: /src/,
      sideEffects: false,
    },
    {
      test: /\.s[ac]ss$/,
      use: ["style-loader", "css-loader", "sass-loader"],
    },
    {
      test: /\.(woff|woff2|eot|otf|ttf)$/,
      type: "asset/inline",
    },
    { 
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    },
  ],
},
resolve: {
  extensions: [".tsx", ".ts", ".js"],
},
};
