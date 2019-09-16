import firebase from 'firebase';

const config = {
  apiKey: "KEY",
  authDomain: "PROJECT",
  databaseURL: "DB",
  projectId: "ID",
  storageBucket: "BUCKET",
  messagingSenderId: "SENDER"
};

let ref

if (!process.env.REACT_APP_DEMO) {
  firebase.initializeApp(config);
  ref = firebase.database().ref('/');
}

export default ref;