const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    app: './js/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/app.js',
  },
  plugins: [
    new Dotenv({
      systemvars: true,
    }),
  ],
};
