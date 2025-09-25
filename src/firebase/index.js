import { initializeApp } from 'firebase/app'
import {
  getAuth, onAuthStateChanged,
  GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut
} from 'firebase/auth'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useUserStore } from '../stores/user'

// 🔐 Use envs in real projects; hardcoded here is fine for quick dev
const firebaseConfig = {
  apiKey: "AIzaSyCSSdg8BPd7qH1skZ1jmJmmdNTMsmuFdzc",
  authDomain: "senior-project-pawmatch.firebaseapp.com",
  projectId: "senior-project-pawmatch",
  storageBucket: "senior-project-pawmatch.firebasestorage.app",   // ← fixed
  messagingSenderId: "258128305500",
  appId: "1:258128305500:web:9b8277391cd1c2988b3599",
}

const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

// Promise to await initial auth state (handy for route guards)
let _resolve
export const authReady = new Promise(res => (_resolve = res))

// 🔸 Call this AFTER Pinia is installed in main.js
export function initFirebaseAuthListener() {
  onAuthStateChanged(auth, (firebaseUser) => {
    const store = useUserStore()
    if (firebaseUser) {
      store.setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      })
    } else {
      store.clear()
    }
    if (_resolve) _resolve(true)
  })
}

export const getCurrentUser = () => auth.currentUser

// Auth helpers
export async function signInWithGooglePopup() {
  const provider = new GoogleAuthProvider()
  await signInWithPopup(auth, provider)
}
export async function signInWithEmailPassword(email, password) {
  await signInWithEmailAndPassword(auth, email, password)
}
export async function createUserWithEmailPassword(email, password) {
  await createUserWithEmailAndPassword(auth, email, password)
}
export async function signOutFirebase() {
  await signOut(auth)
}

// Firestore example
export async function addExampleDoc() {
  return await addDoc(collection(db, 'examples'), {
    createdAt: serverTimestamp(),
    message: 'Hello from Firestore',
  })
}

// Storage example
export async function uploadExampleFile(file, filename) {
  const ref = storageRef(storage, 'uploads/' + filename)
  await uploadBytes(ref, file)
  return await getDownloadURL(ref)
}

export { firebaseApp, auth, db, storage }
