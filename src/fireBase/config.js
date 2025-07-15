// firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // <-- IMPORTANTE

const firebaseConfig = {
  apiKey: "AIzaSyBN0GinLxwQcPwM4JX0mVt7gYlew5HfBxs",
  authDomain: "projeto-despesas-7a680.firebaseapp.com",
  projectId: "projeto-despesas-7a680",
  storageBucket: "projeto-despesas-7a680.firebasestorage.app",
  messagingSenderId: "528823830648",
  appId: "1:528823830648:web:16b671e79ae8a29aaa458d"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // <-- ESSENCIAL para login com Google
