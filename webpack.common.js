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
  externals: {
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js': 'firebase/app',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js': 'firebase/auth',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js': 'firebase/firestore'
  },
  plugins: [
    new Dotenv({
      systemvars: true,
    }),
  ],
};
