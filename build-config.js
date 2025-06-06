// Build script to inject environment variables into firebase-config.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const template = `// Firebase configuration - Generated at build time
export const firebaseConfig = {
  apiKey: "${process.env.VITE_FIREBASE_API_KEY}",
  authDomain: "${process.env.VITE_FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.VITE_FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.VITE_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.VITE_FIREBASE_APP_ID}",
  measurementId: "${process.env.VITE_FIREBASE_MEASUREMENT_ID}"
};`;

// Write to dist directory
const distDir = path.join(__dirname, 'dist', 'js');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.join(distDir, 'firebase-config.js'), template);
console.log('✅ Firebase config generated with environment variables');

// Also copy to source for development
fs.writeFileSync(path.join(__dirname, 'js', 'firebase-config.js'), template);
console.log('✅ Firebase config updated in source directory');