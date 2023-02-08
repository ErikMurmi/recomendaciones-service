
const firebase = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const firebase_app = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.NEXT_PUBLIC_PROJECT_ID}.firebaseio.com`
});

const db = firebase.firestore(firebase_app);
const auth = firebase.auth(firebase_app);


module.exports = {
    firebase_app,
    db,
    auth
  };
