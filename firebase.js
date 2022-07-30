import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore, query, getDocs, collection, where, addDoc, doc, setDoc } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    // databaseUrl: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// const firebaseConfig = {
//     apiKey: "AIzaSyDE9Wb4gUJXiY9lE94X6qY2zX2CE79LoCU",
//     authDomain: "backup-9bb1d.firebaseapp.com",
//     projectId: "backup-9bb1d",
//     storageBucket: "backup-9bb1d.appspot.com",
//     messagingSenderId: "713974430194",
//     appId: "1:713974430194:web:4bec29787df0ff7a99536b"
// };

getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore();
const auth = getAuth();
const rtdb = getDatabase();
// const provider = new GoogleAuthProvider();

const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const docs = await getDocs(q);
        if (docs.docs.length === 0) {
            await setDoc(doc(db,"users",user.uid), {
                uid: user.uid,
                name: user.displayName,
                authProvider: "google",
                email: user.email,
                lqrigip: "",
                limit: 3,
            });
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const logout = () => {
    signOut(auth);
};

// export { db, auth, provider, signInWithPopup };
export { auth, db, signInWithGoogle, logout, collection, doc, rtdb };