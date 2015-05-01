var path = require("path");

module.exports = [{
  name: "browser",
  entry: "./main.js",
  output: {
    path: "build",
    filename: "./bundle.js"
  },
  module: {
    loaders: [{
      test: /\.scss$/,
      loaders: [
        "style-loader",
        "css-loader",
        "autoprefixer-loader",
        "sass-loader"
      ],
    }, {
      test: /\.(js|jsx)$/,
      loader: "jsx-loader"
    }]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
}];