const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'dtapi.js',
    path: path.resolve(__dirname, 'out'),
  },
};