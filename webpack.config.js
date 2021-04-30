const path = require('path');

module.exports = {
  entry: './dist/chrome-ext/extension.js',
  mode: 'development',
  devtool: 'cheap-module-source-map',
  output: {
    filename: 'extension.bundle.js',
    path: path.resolve(__dirname, 'dist/chrome-ext'),
  },
};
