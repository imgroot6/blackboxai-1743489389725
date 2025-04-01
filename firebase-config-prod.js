// Production Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAnsOYAh3w-0pb3QkkSCDOGtHdv3JC_2Sc",
  authDomain: "rabbitcall-6b7a0.firebaseapp.com",
  projectId: "rabbitcall-6b7a0",
  storageBucket: "rabbitcall-6b7a0.firebasestorage.app",
  messagingSenderId: "995065255495",
  appId: "1:995065255495:web:6e765facda6b7b7c3c4362",
  measurementId: "G-Y99M8KQ6LG"
};

// Initialize only once
if (typeof window !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}