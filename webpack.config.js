const path = require('path');

module.exports = {
  entry: './dist/src/browser-ext/extension.js',
  mode: 'development',
  devtool: 'cheap-module-source-map',
  output: {
    filename: 'extension.bundle.js',
    path: path.resolve(__dirname, 'dist/src/browser-ext'),
  },
};
