import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
// For a real application, these should be stored in environment variables
// Using dummy values to allow the app to initialize without crashing.
const firebaseConfig = {
  apiKey: "AIzaSyCQJcezuaaTEAAkvNihOHi6vy9oMO7Rcwo",
  authDomain: "gen-lang-client-0452273955.firebaseapp.com",
  projectId: "gen-lang-client-0452273955",
  storageBucket: "gen-lang-client-0452273955.firebasestorage.app",
  messagingSenderId: "1016339988314",
  appId: "1:1016339988314:web:ead882642b943d40537d63",
  measurementId: "G-NS7JXJ9ZN2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// You can connect to the emulator during development
if (window.location.hostname === "localhost") {
  // To use the local Firebase emulator, run `firebase emulators:start` 
  // and then uncomment the following line:
  // connectFunctionsEmulator(functions, "localhost", 5001);
}

export { app, functions };