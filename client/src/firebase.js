import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    // paste your config here
    apiKey: "AIzaSyB3nuTkncwiLxWUmCKLAm7FHFKL5qhHbMk",
    authDomain: "pumpzone-e5b0f.firebaseapp.com",
    projectId: "pumpzone-e5b0f",
    storageBucket: "pumpzone-e5b0f.firebasestorage.app",
    messagingSenderId: "160043443110",
    appId: "1:160043443110:web:455560cfd03eae52876567",
    measurementId: "G-JE2DZDEP44"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);