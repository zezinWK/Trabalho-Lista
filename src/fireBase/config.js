import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAJKjjHE9UdEEfYxezTkSeEB66rBw24v-E',
  authDomain: 'trabalho-lista.firebaseapp.com',
  projectId: 'trabalho-lista',
  storageBucket: 'trabalho-lista.firebasestorage.app',
  messagingSenderId: '844504325003',
  appId: '1:844504325003:web:b76110cb1d1db19d93ad8e',
  measurementId: 'G-CW8Y343Z5S',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
