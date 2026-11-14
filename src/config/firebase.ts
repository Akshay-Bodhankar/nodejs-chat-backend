const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

if(!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const firestore = admin.firestore();

console.log("Firebase Firestore initialized sucessfully");

module.exports = firestore;