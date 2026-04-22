import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "farmacliniq-a0691.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "farmacliniq-a0691",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "farmacliniq-a0691.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "918911915100",
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const hasValidConfig = !!firebaseConfig.apiKey;

let app;
let firebaseAuth;
let firestoreDb;

if (hasValidConfig) {
    app = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(app);
    firestoreDb = getFirestore(app);

    // Habilitar Persistência Offline para PWA Elite
    if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(firestoreDb).catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn("Múltiplas abas abertas: persistência limitada.");
            } else if (err.code === 'unimplemented') {
                console.warn("Navegador não suporta persistência.");
            }
        });
    }
}

export const auth = firebaseAuth as any;
export const db = firestoreDb as any;

