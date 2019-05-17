import firebase from 'firebase';

const config = {
  apiKey: "KEY",
  authDomain: "PROJECT",
  databaseURL: "DB",
  projectId: "ID",
  storageBucket: "BUCKET",
  messagingSenderId: "SENDER"
};

firebase.initializeApp(config);
const ref = firebase.database().ref('/');

export default ref;