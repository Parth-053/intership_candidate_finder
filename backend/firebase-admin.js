const admin = require('firebase-admin');

// Apni service account key ka path
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Aapka database URL (Firestore tab se mil jayega)
  databaseURL: "https://careerconnect-ba944.firebaseio.com" 
});

const db = admin.firestore();
const auth = admin.auth(); // Firebase Authentication ko access karne ke liye

module.exports = { db, auth, admin };